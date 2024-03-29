import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Types "./Types";
import Conversion "./Conversion";

import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";

import ICS2Utils "mo:ics2-core/Utils";


shared (installation) actor class (initArgs : Types.WidgetServiceArgs) = this {

	// immutable field
	let _CREATOR:CommonTypes.Identity = {
		identity_type = #ICP;
		identity_id = Principal.toText(installation.caller);
	};
	// registry actor
	var registry:Text = Option.get(initArgs.package_registry, "{DEFAULT_REGISTRY_PLACE_HERE}");

    stable var owner:CommonTypes.Identity = Option.get(initArgs.owner, {
		identity_type = #ICP; identity_id = Principal.toText(installation.caller) 
	});

	stable let _NETWORK = initArgs.network;

	// trial allowance -- minimum number of packages to deploy even if allowances is not set. This is controlled by access_list.
	stable var trial_allowance : Nat = 0;	

	// all registered widgets, order is maintaited
	stable var all_widgets : List.List<Text> = List.nil();

	// type to package
    stable var type2widget : Trie.Trie<Text, List.List<Text>> = Trie.empty();

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
	
    private func type2widget_get(id : Text) : ?List.List<Text> = Trie.get(type2widget, CommonUtils.text_key(id), Text.equal);	
	
	/**
	* Transfers ownership of the widget service from current owner to the new one
	*/
	public shared ({ caller }) func transfer_ownership (to : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		owner :=to;
		#ok();
	};

	/**
	* Applies the trial allowance
	*/
	public shared ({ caller }) func apply_trial_allowance (v : Nat) : async Result.Result<(), CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		if (not can_manage(caller)) return #err(#AccessDenied);
		trial_allowance := v;
		#ok();
	};	

	/**
	* Registers an allowance
	*/
	public shared ({ caller }) func register_allowance (args : Types.AllowanceArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
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
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
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
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		let identity = _build_identity(caller);
		// allowed or not
		let allowance = switch (allowance_get(identity)) {
			case (?c) {c.allowed_widgets};
			case (null) {trial_allowance};
		};
		if (allowance == 0) return #err(#AccessDenied);
		// already created
		let created = switch (creator2widget_get(identity)) {
			case (?c) {List.size(c)};
			case (null) {0};
		};
		if (created >= allowance) return #err(#AccessDenied);

		let opt:?Types.Options = switch (args.options) {
			case (?options) {
				?{
					var width = options.width;
					var height = options.height;
					var payload_items = options.payload_items;
				};
			};
			case (null) {null};
		};

		let cr:?Types.Criteria = switch (args.criteria) {
			case (?criteria) {
				// validate entity
				if (Option.isSome(criteria.entity)) {
					let valid_ids = await _validate_entities(CommonUtils.unwrap(criteria.entity));
					if (not valid_ids) return #err(#InvalidRequest);
				};
				?{
					var entity = criteria.entity;
					var by_country_code = criteria.by_country_code;
					var by_tag = criteria.by_tag;
					var by_classification = criteria.by_classification;
				};
			};
			case (null) {null};
		};

		// increment counter
		_counter  := _counter + 1;
        let canister_id = Principal.toText(Principal.fromActor(this));
        let widget_id = ICS2Utils.hash_time_based(canister_id, _counter);

		widgets := Trie.put(widgets, CommonUtils.text_key(widget_id), Text.equal, {
			var name = args.name;
			var description = args.description;
			type_id = args.type_id;
			// widget is created with a Draft status;
			var status = #Draft;
			var criteria = cr;
			var options = opt;
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

		// index by type
		let type_key = _resolve_widget_type(args.type_id);
		switch (type2widget_get(type_key)) {
			case (?by_kind) {type2widget := Trie.put(type2widget, CommonUtils.text_key(type_key), Text.equal, List.push(widget_id, by_kind)).0; };
			case (null) {type2widget := Trie.put(type2widget, CommonUtils.text_key(type_key), Text.equal, List.push(widget_id, List.nil())).0;}
		};		
		#ok(widget_id);
	};

	/**
	* Updates an existing widget, just override  description, name and if they specified
	* Allowed only to the owner of the widget.
	*/
	public shared ({ caller }) func update_widget (id: Text, args : Types.WidgetUpdateArgs) : async Result.Result<Text, CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		switch (widget_get(id)) {
			case (?widget) {
				let identity = _build_identity(caller);
            	// account should be controlled by owner,
				if (not CommonUtils.identity_equals(identity, widget.creator))  return #err(#AccessDenied);
				if (Option.isSome(args.name)) {
					widget.name:= CommonUtils.unwrap(args.name);
				};                
				if (Option.isSome(args.description)) {
					widget.description:= CommonUtils.unwrap(args.description);
				};
				if (Option.isSome(args.status)) {
					widget.status:= CommonUtils.unwrap(args.status);
				};				
				
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
		
	};

	/**
	* Updates widget criteria & options
	*/
	public shared ({ caller }) func update_widget_payload (widget_id:Text, criteria: ?Types.CriteriaArgs, options: ?Types.OptionsArgs) : async Result.Result<Text, CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		switch (widget_get(widget_id)) {
			case (?w) {
				let identity = _build_identity(caller);
				if (not CommonUtils.identity_equals(identity, w.creator))  return #err(#AccessDenied);
				// update criteria
				switch (criteria) {
					case (?cr) {
						// validate entity
						if (Option.isSome(cr.entity)) {
							let valid_ids = await _validate_entities(CommonUtils.unwrap(cr.entity));
							if (not valid_ids) return #err(#InvalidRequest);
						};

						w.criteria:=?{
							var entity = cr.entity;
							var by_country_code = cr.by_country_code;
							var by_tag = cr.by_tag;
							var by_classification = cr.by_classification;
						};
					};
					case (null) {};
				};
				// update options
				switch (options) {
					case (?opt) {
						w.options:=?{
							var width = opt.width;
							var height = opt.height;
							var payload_items = opt.payload_items;
						};						
					};
					case  (null) {};
				};
				return #ok(widget_id);
			};
			case (null) {return #err(#NotFound)}
		};
	};

	/**
	* Change widget status
	*/
	public shared ({ caller }) func update_widget_status (widget_id:Text, status: Types.Status) : async Result.Result<Text, CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
		switch (widget_get(widget_id)) {
			case (?w) {
				let identity = _build_identity(caller);
				if (not CommonUtils.identity_equals(identity, w.creator))  return #err(#AccessDenied);
				w.status := status;
				return #ok(widget_id);
			};
			case (null) {return #err(#NotFound)}
		};
	};	

	/**
	* Removes an existing widget object
	*/
	public shared ({ caller }) func remove_widget (widget_id:Text) : async Result.Result<Text, CommonTypes.Errors> {
		if (Principal.isAnonymous(caller)) return #err(#UnAuthorized);
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

    public query func get_widget(id:Text) : async Result.Result<Conversion.WidgetView, CommonTypes.Errors> {
		switch (widget_get(id)) {
			case (?widget) { #ok(Conversion.convert_widget_view(widget, id)); };
			case (null) { return #err(#NotFound); };
		};
    };	

	public composite query ({ caller }) func query_widget_items (widget_id:Text) : async Result.Result<[Conversion.WidgetItemView], CommonTypes.Errors> {
		switch (widget_get(widget_id)) {
			case (null) {return #err(#NotFound)};
			case (?w) {
				//if Draft, then only owner can inspect the data
				if (w.status != #Active) {
					let identity = _build_identity(caller);
					if (not CommonUtils.identity_equals(identity, w.creator))  return #err(#AccessDenied);
					//return #err(#InvalidRequest);
				};

				let items = switch (w.criteria) {
					case (?criteria) {
						// load all needed items
						// logic based on the criteria : entity has higher priority 
						switch (criteria.entity) {
							// load by entity
							case (?entity) {
								let package_actor : Types.Actor.BundlePackageActor = actor (entity.package_id);
								let items = switch (entity.ids) {
									case (?ids) {
										await package_actor.get_bundles_by_ids(ids);
									};
									case (null) {
										let slice = await package_actor.get_bundles_page(0, 1000, null);
										slice.items;
									};
								};
								Conversion.convert_bundle_items(items, entity.package_id);
							};
							// load by options
							case (null) {

								let registry_actor : Types.Actor.PackageRegistryActor = actor (registry);
		
								let packages = await registry_actor.get_packages_by_criteria({
									intersect = true;
									// no filter by type
									kind = null;
									// no filter by ceator
									creator = null;
									country_code = criteria.by_country_code;
									tag = criteria.by_tag;
									classification = criteria.by_classification;
								});
								// it might be reasonable to restrict list of packages here
								let p_ids = Array.map<Types.Actor.BundlePackageView, Text> (packages, func x = x.id);
								let res = Buffer.Buffer<Conversion.WidgetItemView>(Array.size(p_ids));
								//extra filter for any package
								let bundle_criteria = _bundle_search_criteria(criteria);
								for (id in p_ids.vals()) {
									let package_actor : Types.Actor.BundlePackageActor = actor (id);
									// todo : in fact we have to filter bundles by tag/country/classification
									let slice = await package_actor.get_bundles_page(0, 1000, bundle_criteria);
									for (bundle in slice.items.vals()) {
										res.add(Conversion.convert_bundle_item(bundle, id));
									};
								};
								Buffer.toArray(res);

							};
						};
					};
					// no criteria, no items
					case (null) {[]};
				};

				return #ok(items);
			};
		};
	};

	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept<system>(amount);
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
			case (null) {trial_allowance};
		};
	};

	/**
	* Returns widgets by ids
	*/
    public query func get_widgets(ids:[Text]) : async [Conversion.WidgetView] {
		CommonUtils.get_items_by_ids(ids, widget_get, Conversion.convert_widget_view);
    };	

	/**
	* Returns widgets for the current user. Request for pagination
	*/
  	public query ({ caller }) func get_my_widgets_page(start: Nat, limit: Nat) : async CommonTypes.DataSlice<Conversion.WidgetView> {
		let identity = _build_identity(caller);
		CommonUtils.get_page(_get_ids_for_criteria({
			creator = ?identity;
			kind = null;
			intersect = false;
		}), start, limit, widget_get, Conversion.convert_widget_view);		
  	};	

	/**
	* Returns widgets for the creator. Request for pagination
	*/
    public query func get_widgets_page_by_creator(start: Nat, limit: Nat, identity:CommonTypes.Identity) : async CommonTypes.DataSlice<Conversion.WidgetView> {
		CommonUtils.get_page(_get_ids_for_criteria({
			creator = ?identity;
			kind = null;
			intersect = false;
		}), start, limit, widget_get, Conversion.convert_widget_view);
    };

	/**
	* Returns widgets. Request for pagination
	*/
    public query func get_widgets_page(start: Nat, limit: Nat, criteria: Types.SearchCriteriaArgs): async CommonTypes.DataSlice<Conversion.WidgetView> {
		CommonUtils.get_page(_get_ids_for_criteria(criteria), start, limit, widget_get, Conversion.convert_widget_view);
    };	
	/**
	* Returns widgets based on the search crriteria.
	*/
	public query func get_widgets_by_criteria(criteria:Types.SearchCriteriaArgs) : async  [Conversion.WidgetView] {
		CommonUtils.get_items_by_ids(_get_ids_for_criteria(criteria), widget_get, Conversion.convert_widget_view);
	};	

	public query func activity_by(identity:CommonTypes.Identity) : async Types.Activity {
		_activity_by(identity);
	};

	public query func get_trial_allowance() : async Nat {
		return trial_allowance;
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
	private func _validate_entities (entity : Types.IdsRef) : async Bool {
		// validate package id
		let valid_pacakge = await _validate_packages([entity.package_id]);
		if (not valid_pacakge) return false;

		switch (entity.ids) {
			case (?ids) {
				//since the package already validated, then it is a valid one. Lets check the items
				let package_actor : Types.Actor.BundlePackageActor = actor (entity.package_id);
				let validated_ids = await package_actor.get_refs_by_ids(ids);
				return Array.size(validated_ids) == Array.size(ids);				
			};
			// no bundles, it means all items from the package above
			case (null) {return true};
		};
	};

	private func _get_ids_for_criteria(criteria:Types.SearchCriteriaArgs) :  [Text] {
		let by_creator = switch (criteria.creator) {
			case (?identity) {
				switch (creator2widget_get(identity)) {
					case (?ids) { List.toArray(ids) };
					case (null) { [] };
				}
			};
			case (null) {[]};
		};
		let by_type = switch (criteria.kind) {
			case (?kind) {
				let kind_key = _resolve_widget_type(kind);
				switch (type2widget_get(kind_key)) {
					case (?by_kind) {(List.toArray(by_kind)) };
					case (null) {[]};
				};
			};
			case (null) {[]};
		};

		// quick return
		if (by_type.size() == 0) return by_creator;


		if (criteria.intersect) {CommonUtils.build_intersect([by_creator, by_type]);}
		else {CommonUtils.build_uniq([by_creator, by_type])};
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
			case (null) {trial_allowance};
		};
		{ registered_widgets = switch (creator2widget_get(identity)) {
			case (?c) {List.toArray(c)};
			case (null) {[]};
		}; allowance = allowance;
		};
	};

	private func _bundle_search_criteria (widget_crriteria:Types.Criteria) : ?Types.BundleSearchCriteria {
		if (Option.isSome(widget_crriteria.by_country_code) or
			Option.isSome(widget_crriteria.by_tag) or
			Option.isSome(widget_crriteria.by_classification)) {
			return ?{
				intersect = true;
				creator = null;
				country_code = widget_crriteria.by_country_code;
				tag = widget_crriteria.by_tag;
				classification = widget_crriteria.by_classification;
			};
		};
		return null;
	};

	private func _resolve_widget_type (widget_type: Types.TypeId) : Text {
        switch (widget_type) {
            case (#Bundle) { "Bundle"};
            case (#Feed) { "Feed"};
        };
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