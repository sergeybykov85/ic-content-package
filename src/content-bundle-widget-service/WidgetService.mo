import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Debug "mo:base/Debug";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Buffer "mo:base/Buffer";

import Conversion "./Conversion";
import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";

import Utils "./Utils";
import Types "./Types";

shared (installation) actor class WidgetService(initArgs : Types.WidgetServiceArgs) = this {

	let DEF_ALLOWANCE:Nat = 10;
	
	// immutable field
	let CREATOR:CommonTypes.Identity = {
		identity_type = #ICP;
		identity_id = Principal.toText(installation.caller);
	};
	// registry actor
	var registry:Text = Option.get(initArgs.package_registry, "{DEFAULT_REGISTRY_PLACE_HERE}");

    stable var owner:CommonTypes.Identity = Option.get(initArgs.owner, {
		identity_type = #ICP; identity_id = Principal.toText(installation.caller) 
	});

	stable let NETWORK = initArgs.network;

	// all registered widgets, order is maintaited
	stable var all_widgets : List.List<Text> = List.nil();

    // all widgets, key - uiniq widget id
    stable var widgets : Trie.Trie<Text, Types.Widget> = Trie.empty();

    // all allowances, key - identity, value - allowance
    stable var allowance : Trie.Trie<Text, Types.Allowance> = Trie.empty();	

	/**
	* Widget registry contains the global mapping. User can register widgets, it is cool
	*/
    stable var creator2widget : Trie.Trie<Text, List.List<Text>> = Trie.empty();	

	stable var _counter : Nat = 0;

	private func widget_get(id : Text) : ?Types.Widget = Trie.get(widgets, CommonUtils.text_key(id), Text.equal);

	private func creator2widget_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(creator2widget, CommonUtils.identity_key(identity), Text.equal);

    private func allowance_get(identity : CommonTypes.Identity) : ?Types.Allowance = Trie.get(allowance, CommonUtils.identity_key(identity), Text.equal);
	/**
	* Transfers ownership of the widget service from current owner to the new one
	*/
	public shared ({ caller }) func transfer_ownership (to : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		owner :=to;
		#ok();
	};

	/**
	* Registers an allowance
	*/
	public shared ({ caller }) func register_allowance (args : Types.AllowanceArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (allowance_get(args.identity)) {
			case (?allowance) { return #err(#DuplicateRecord); };
			case (null) {
				allowance := Trie.put(allowance, CommonUtils.identity_key(args.identity), Text.equal, {
					allowed_widgets = args.allowed_widgets;
				}).0;
				#ok();
			}
		};
	};
	/**
	* Removes an existing allowance
	*/
	public shared ({ caller }) func remove_allowance (identity : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (allowance_get(identity)) {
			case (null) { return #err(#NotFound); };
			case (?all) {
				allowance := Trie.remove(allowance, CommonUtils.identity_key(identity), Text.equal).0; 
				#ok();
			}
		}
	};

	/**
	* Creates a new widget object
	*/
	public shared ({ caller }) func create_widget (args : Types.WidgetCreationRequest) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		// allowed or not
		let allowance = switch (allowance_get(identity)) {
			case (?c) {c.allowed_widgets};
			case (null) {DEF_ALLOWANCE};
		};
		if (allowance == 0) return #err(#AccessDenied);
		// already created
		let created = switch (creator2widget_get(identity)) {
			case (?c) {List.size(c)};
			case (null) {0};
		};
		if (created >= allowance) return #err(#AccessDenied);
		let cr:?Types.Criteria = switch (args.criteria) {
			case (?criteria) {
				// validate ids
				if (Array.size(criteria.ids) > 0) {
					let valid_ids = await _validate_entities(criteria.ids);
					if (not valid_ids) return #err(#InvalidRequest);
				};
				// validate packages
				if (Array.size(criteria.packages) > 0) {
					let valid_packs = await _validate_packages(criteria.packages);
					if (not valid_packs) return #err(#InvalidRequest);
				};				
				?{
					var ids = criteria.ids;
					var packages = criteria.packages;
					var tags = criteria.tags;
					var classifications = criteria.classifications;
				};
			};
			case (null) {null};
		};

		// increment counter
		_counter  := _counter + 1;
        let canister_id = Principal.toText(Principal.fromActor(this));
        let widget_id = Utils.hash_time_based(canister_id, _counter);

		widgets := Trie.put(widgets, CommonUtils.text_key(widget_id), Text.equal, {
			var name = args.name;
			var description = args.description;
			type_id = args.type_id;
			var criteria = cr;
			var options = null; // for now it is not supported
			creator = identity;
			created = Time.now();
		}:Types.Widget).0;

		// index for all widgets
		all_widgets:= List.push(widget_id, all_widgets);

		// index for creator
		switch (creator2widget_get(identity)) {
			case (?by_creator) {creator2widget := Trie.put(creator2widget, CommonUtils.identity_key(identity), Text.equal, List.push(widget_id, by_creator)).0; };
			case (null) {creator2widget := Trie.put(creator2widget, CommonUtils.identity_key(identity), Text.equal, List.push(widget_id, List.nil())).0;}
		};
		#ok(widget_id);
	};

	public shared ({ caller }) func update_widget_criteria (widget_id:Text, criteria: Types.CriteriaArgs) : async Result.Result<Text, CommonTypes.Errors> {
		switch (widget_get(widget_id)) {
			case (?w) {
				let identity = _build_identity(caller);
				if (not CommonUtils.identity_equals(identity, w.creator))  return #err(#AccessDenied);
				
				// validate ids
				if (Array.size(criteria.ids) > 0) {
					let valid_ids = await _validate_entities(criteria.ids);
					if (not valid_ids) return #err(#InvalidRequest);
				};
				// validate packages
				if (Array.size(criteria.packages) > 0) {
					let valid_packs = await _validate_packages(criteria.packages);
					if (not valid_packs) return #err(#InvalidRequest);
				};
				w.criteria:=?{
					var ids = criteria.ids;
					var packages = criteria.packages;
					var tags = criteria.tags;
					var classifications = criteria.classifications;
				};
				return #ok(widget_id);
			};
			case (null) {return #err(#NotFound)}
		};
	};	

	/**
	* Removes an existing widget object
	*/
	public shared ({ caller }) func remove_widget (widget_id:Text) : async Result.Result<Text, CommonTypes.Errors> {
		switch (widget_get(widget_id)) {
			case (?w) {
				let identity = _build_identity(caller);
				if (not CommonUtils.identity_equals(identity, w.creator))  return #err(#AccessDenied);
				// remove widget
				widgets := Trie.remove(widgets, CommonUtils.text_key(widget_id), Text.equal).0; 
				// remove reference
				switch (creator2widget_get(identity)) {
					case (?by_creator) {
						let fpack = List.mapFilter<Text, Text>(by_creator,
							func(b:Text) : ?Text {
								if (b == widget_id) { return null; }
								else { return ?b; }
							}
						);
						creator2widget := Trie.put(creator2widget, CommonUtils.identity_key(identity), Text.equal, fpack).0; };
					case (null) {};
				};				
				return #ok(widget_id);
			};
			case (null) {return #err(#NotFound)}
		};
	};
	


	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept(amount);
  	};
	
	public query func available_cycles() : async Nat {
		return Cycles.balance();
  	};

	public query func get_registry() : async Text {
		return registry;
	};	

	public query func total_supply_by(identity:CommonTypes.Identity) : async Nat {
		switch (creator2widget_get(identity)) {
			case (?c) {List.size(c)};
			case (null) {0};
		};
	};

    public query func get_widgets_by(identity:CommonTypes.Identity) : async [Text] {
		switch (creator2widget_get(identity)) {
			case (?ids) { List.toArray(ids) };
			case (null) { [] };
		};
    };	

	public query func allowance_by(identity:CommonTypes.Identity) : async Nat {
		switch (allowance_get(identity)) {
			case (?c) {c.allowed_widgets};
			case (null) {DEF_ALLOWANCE};
		};
	};
	/**
	* Returns widgets by ids
	*/
    public query func get_widgets(ids:[Text]) : async [Conversion.WidgetView] {
		_get_widgets(ids);
    };	

	/**
	* Returns widgets for the creator
	*/
    public query func get_widgets_for_creator(identity:CommonTypes.Identity) : async [Conversion.WidgetView] {
		switch (creator2widget_get(identity)) {
			case (?ids) { _get_widgets(List.toArray(ids)) };
			case (null) { [] };
		};
    };	

	public query func activity_by(identity:CommonTypes.Identity) : async Types.Activity {
		_activity_by(identity);
	};

	public query func total_supply() : async Nat {
		return List.size(all_widgets);
	};

	public query func total_supply_by_creator(identity:CommonTypes.Identity) : async Nat {
		switch (creator2widget_get(identity)) {
			case (?ids) {List.size(ids)};
			case (null) {0};
		};
	};	

	/**
	* Validates if packages are registered. It is ok to add more validation rules later like checking if the bundle id is valid etc
	*/
	private func _validate_entities (ids : [Types.EntityRef]) : async Bool {
		let packages = Array.map<Types.EntityRef, Text>(ids, func ref = ref.package_id);
		await _validate_packages(packages);
	};

	/**
	* Validates if packages are registered.
	*/
	private func _validate_packages (ids : [Text]) : async Bool {
		let registry_actor : Types.Actor.PackageRegistryActor = actor (registry);
		
		let packages = await registry_actor.get_packages(ids);
		// very simple validation
		return (Array.size(packages) == Array.size(ids));

	};

	private func _activity_by(identity:CommonTypes.Identity) : Types.Activity {
		let allowance = switch (allowance_get(identity)) {
			case (?c) {c.allowed_widgets};
			case (null) {DEF_ALLOWANCE};
		};
		{ registered_widgets = switch (creator2widget_get(identity)) {
			case (?c) {List.toArray(c)};
			case (null) {[]};
		}; allowance = allowance;
		};
	};


    private func _get_widgets(ids:[Text]) : [Conversion.WidgetView] {
		let res = Buffer.Buffer<Conversion.WidgetView>(Array.size(ids));
		for (id in ids.vals()) {
			switch (widget_get(id)) {
				case (?w) { res.add(Conversion.convert_widget_view(id, w))};
				case (null) {  };
			};
		};
		Buffer.toArray(res);
    };
	

	private func _build_identity (caller : Principal) : CommonTypes.Identity {
		// right now we return always ICP, but it will be extended in case of ethereum authentication
		// in case of Ethereum support, then we have to call other authentication service to find a session-based principal
		// right now we always return ICP identity
		{
			identity_type = #ICP;
			identity_id = Principal.toText(caller);
		};
	};	

	private func can_manage (caller : Principal) : Bool {
		let identity = {identity_type = #ICP; identity_id = Principal.toText(caller)};
		CommonUtils.identity_equals(identity, owner)
    };

}