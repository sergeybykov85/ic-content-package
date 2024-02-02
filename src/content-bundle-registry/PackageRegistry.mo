import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Buffer "mo:base/Buffer";

import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";

import Utils "./Utils";
import Types "./Types";
import Conversion "./Conversion";
import EmbededUI "./EmbededUI";

// -- ICS2 core --
import ICS2Http "mo:ics2-core/Http";

shared (installation) actor class PackageRegistry(initArgs : Types.PackageRegistryArgs) = this {

	// immutable field
	let CREATOR:CommonTypes.Identity = {
		identity_type = #ICP;
		identity_id = Principal.toText(installation.caller);
	};

	// registry actor
	var index_service:Text = Option.get(initArgs.index_service, "{DEFAULT_INDEXSERVICE_PLACE_HERE}");	

    stable var owner:CommonTypes.Identity = Option.get(initArgs.owner, {
		identity_type = #ICP; identity_id = Principal.toText(installation.caller) 
	});

	stable let NETWORK = initArgs.network;

	// who can manage service : who can register new submitters etc
	stable var access_list : List.List<CommonTypes.Identity> = List.nil();

	// creator of the package
    stable var creator2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

	// who submitted a package : service or channel partner
    stable var submitter2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

	// all registered packages, order is maintaited
	stable var all_packages : List.List<Text> = List.nil();

	// type to package
    stable var type2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

    // all submitters, key - identity
    stable var submitters : Trie.Trie<Text, Types.Submitter> = Trie.empty();

    // all packages, key - principal id
    stable var packages : Trie.Trie<Text, Types.BundlePackage> = Trie.empty();

    private func creator2package_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(creator2package, CommonUtils.identity_key(identity), Text.equal);

    private func submitter2package_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(submitter2package, CommonUtils.identity_key(identity), Text.equal);

    private func package_get(id : Text) : ?Types.BundlePackage = Trie.get(packages, CommonUtils.text_key(id), Text.equal);

    private func type2package_get(id : Text) : ?List.List<Text> = Trie.get(type2package, Utils.submission_key(id), Text.equal);	

    private func submitter_get(identity : CommonTypes.Identity) : ?Types.Submitter = Trie.get(submitters, CommonUtils.identity_key(identity), Text.equal);


	/**
	* Applies list of users who can manage providers
	*/
	public shared ({ caller }) func apply_access_list (identities : [CommonTypes.Identity]) : async Result.Result<(), CommonTypes.Errors> {
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		access_list := List.fromArray(identities);
		#ok();
	};

	/**
	* Transfers ownership of the registry from current owner to the new one
	*/
	public shared ({ caller }) func transfer_ownership (to : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		owner :=to;
		#ok();
	};


	/**
	* Change the index service
	*/
	public shared ({ caller }) func apply_index_service (to : Principal) : async Result.Result<(), CommonTypes.Errors> {
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		index_service := Principal.toText(to);
		#ok();
	};	
	/**
	* Registerrs a new package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func register_submitter (args : Types.CommonArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (submitter_get(args.identity)) {
			case (?customer) { return #err(#DuplicateRecord); };
			case (null) {
				let submitter : Types.Submitter = {
					var name = args.name;
					var description = args.description;
					identity = args.identity;
					var packages = List.nil();
					created = Time.now();
				};
				submitters := Trie.put(submitters, CommonUtils.identity_key(args.identity), Text.equal, submitter).0;
				#ok();
			}
		};
	};
	/**
	* Removes an existing package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func remove_submitter (identity : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (submitter_get(identity)) {
			case (null) { return #err(#NotFound); };
			case (?customer) {
				submitters := Trie.remove(submitters, CommonUtils.identity_key(identity), Text.equal).0; 
				#ok();
			}
		}
	};
	/**
	* Updates an existing package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func update_submitter (args : Types.CommonUpdateArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (submitter_get(args.identity)) {
			case (null) { return #err(#NotFound); };
			case (?customer) {
				if (Option.isSome(args.name)) {
					customer.name:= CommonUtils.unwrap(args.name);
				};                
				if (Option.isSome(args.description)) {
					customer.description:= CommonUtils.unwrap(args.description);
				};
				#ok();			
			}
		};
	};

	/**
	* Registerrs a new package provider (who is authorized to add new packages).
	* If creator is not specified, then creator is taken fron the package
	*/
	public shared ({ caller }) func register_package (package : Principal, assign_creator : ?CommonTypes.Identity) : async Result.Result<Text, CommonTypes.Errors> {
		let submitter_identity = _build_identity(caller);
		switch (submitter_get(submitter_identity)) {
			case (?submitter) {
				let package_id = Principal.toText(package);
				switch (package_get(package_id)) {
					case (?pack) {return #err(#DuplicateRecord)};
					case (null) {

						let package_actor : Types.Actor.BundlePackageActor = actor (package_id);
						let package_details = await package_actor.get_details();

						let creator = Option.get(assign_creator, package_details.creator);
						packages := Trie.put(packages, CommonUtils.text_key(package_id), Text.equal, {
							submission = package_details.submission;
							var name = package_details.name;
							var description = package_details.description;
							var logo_url = package_details.logo_url;
							var references = List.nil();
							max_supply = package_details.max_supply;
							creator = creator;
							submitter = submitter_identity;
							created = package_details.created;
							registered = Time.now();
						}:Types.BundlePackage).0;

						submitter.packages:=List.push(package_id, submitter.packages);
						// index for all packages
						all_packages:= List.push(package_id, all_packages);
						// index for submitter
						switch (submitter2package_get(submitter_identity)) {
							case (?by_provider) {submitter2package := Trie.put(submitter2package, CommonUtils.identity_key(submitter_identity), Text.equal, List.push(package_id, by_provider)).0; };
							case (null) {submitter2package := Trie.put(submitter2package, CommonUtils.identity_key(submitter_identity), Text.equal, List.push(package_id, List.nil())).0;}
						};
						// index for creator
						switch (creator2package_get(creator)) {
							case (?by_creator) {creator2package := Trie.put(creator2package, CommonUtils.identity_key(creator), Text.equal, List.push(package_id, by_creator)).0; };
							case (null) {creator2package := Trie.put(creator2package, CommonUtils.identity_key(creator), Text.equal, List.push(package_id, List.nil())).0;}
						};

						// index by kind
						let submission_key = Utils.resolve_submission_name(package_details.submission);
						switch (type2package_get(submission_key)) {
							case (?by_kind) {type2package := Trie.put(type2package, Utils.submission_key(submission_key), Text.equal, List.push(package_id, by_kind)).0; };
							case (null) {type2package := Trie.put(type2package, Utils.submission_key(submission_key), Text.equal, List.push(package_id, List.nil())).0;}
						};

						// register in the tag service
						let index_service_actor : Types.Actor.IndexServiceActor = actor (index_service);
						ignore await index_service_actor.register_package(package);	
						return #ok(package_id);
					};
				};
			};
			case (null) { return #err(#AccessDenied); };
		}
	};

	/**
	* Regreshes the information about the registered package like name, description, logo
	*/
	public shared ({ caller }) func refresh_package (package : Principal) : async Result.Result<(), CommonTypes.Errors> {
		let caller_identity = _build_identity(caller);
		let package_id = Principal.toText(package);
		switch (package_get(package_id)) {
			case (null) {return #err(#NotFound)};
			case (?pack) {
				// check authorization : only package creator or package provider
				if (not (CommonUtils.identity_equals (caller_identity, pack.creator) or
					CommonUtils.identity_equals (caller_identity, pack.submitter)))  return #err(#AccessDenied); 

				let package_actor : Types.Actor.BundlePackageActor = actor (package_id);
				let package_details = await package_actor.get_details();

				pack.name :=package_details.name;
				pack.description :=package_details.description;
				pack.logo_url :=package_details.logo_url;
										
				return #ok();
			};
		};
	};

	public shared query ({ caller }) func http_request(request : ICS2Http.Request) : async ICS2Http.Response {
		switch (Utils.get_resource_id(request.url)) {
			case (?r) {
				//view_mode is ignore for now
				if (r.id == Utils.ROOT) {
					let canister_id = Principal.toText(Principal.fromActor(this));
					var out_html = EmbededUI.render_root_header(r.submission_type, Trie.size(packages));
					switch (r.submission_type) {
						case (?t) {
							let submission = Utils.normalize(t);
							switch (type2package_get(submission)) {
								case (?package_ids) {
									for (id in List.toIter(package_ids)) {
										switch (package_get(id)) {
            								case (null) { };
            								case (? r)  { out_html:=out_html # EmbededUI.render_overview(canister_id,initArgs.network, id, r);};
										};
									};
								};
								case (null) {};
							};
						};						
						case (null) {
							for ((id, r) in Trie.iter(packages)) {
								out_html:=out_html # EmbededUI.render_overview(canister_id, initArgs.network, id, r);
							};						
						};
					};
					return ICS2Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(out_html #EmbededUI.FORMAT_DATES_SCRIPT#"</body></html>"));
				};
				EmbededUI.page_response( Principal.toText(Principal.fromActor(this)), initArgs.network, r.id, package_get(r.id));				
			};
			case null { return ICS2Http.not_found();};
		};
	};	

	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept(amount);
  	};
	
	public query func available_cycles() : async Nat {
		return Cycles.balance();
  	};

	/**
	* Returns package information by id. This response contains only a basic info without any details about the data groups.
	*/
    public query func get_package(id:Text) : async Result.Result<Conversion.BundlePackageView, CommonTypes.Errors> {
		switch (package_get(id)) {
			case (?package) { #ok(Conversion.convert_package_view(id, package)); };
			case (null) { return #err(#NotFound); };
		};
    };

    public query func get_submitter(identity:CommonTypes.Identity) : async Result.Result<Conversion.SubmitterView, CommonTypes.Errors> {
		switch (submitter_get(identity)) {
			case (?submitter) { #ok(Conversion.convert_submitter_view(submitter)); };
			case (null) { return #err(#NotFound); };
		};
    };

    public query func is_submitter(identity:CommonTypes.Identity) : async Bool {
		switch (submitter_get(identity)) {
			case (?submitter) { true; };
			case (null) { false; };
		};
    };	

	/**
	* Returns packages for the provider
	*/
    public query func get_packages_for_submitter(identity:CommonTypes.Identity) : async [Conversion.BundlePackageView] {
		switch (submitter2package_get(identity)) {
			case (?ids) { _get_packages(List.toArray(ids)) };
			case (null) { [] };
		};
    };

	/**
	* Returns packages for the creator
	*/
    public query func get_packages_for_creator(identity:CommonTypes.Identity) : async [Conversion.BundlePackageView] {
		switch (creator2package_get(identity)) {
			case (?ids) { _get_packages(List.toArray(ids)) };
			case (null) { [] };
		};
    };

	/**
	* Returns packages for the type
	*/
    public query func get_packages_by_type(kind:Types.Submission) : async [Conversion.BundlePackageView] {
		let kind_key = Utils.resolve_submission_name(kind);
		switch (type2package_get(kind_key)) {
			case (?by_kind) {  _get_packages(List.toArray(by_kind)) };
			case (null) {[]};
		};
    };	

    public query func get_package_ids () : async [Text] {
		List.toArray(all_packages);
    };	

    public query func get_packages(ids:[Text]) : async [Conversion.BundlePackageView] {
		_get_packages(ids);
    };

	public query func total_supply() : async Nat {
		return Trie.size(packages);
	};

	public query func total_supply_by_types(types: [Text]) : async [Nat] {
		let res = Buffer.Buffer<Nat>(Array.size(types));
		for (t in types.vals()) {
			let i = switch (type2package_get(t)) {
				case (?by_kind) {List.size(by_kind)};
				case (null) {0};
			};
			res.add(i);
		};
		Buffer.toArray(res);		
	};

	public query func total_supply_by_creator(identity:CommonTypes.Identity) : async Nat {
		switch (creator2package_get(identity)) {
			case (?ids) {List.size(ids)};
			case (null) {0};
		};
	};

	public query func total_supply_by_submitter(identity:CommonTypes.Identity) : async Nat {
		switch (submitter2package_get(identity)) {
			case (?ids) {List.size(ids)};
			case (null) {0};
		};
	};

	/**
	* Returns data segmentation, aka classification over all packages
	*/
	public composite  query func get_data_segmentation() : async CommonTypes.Segmentation {
		let index_service_actor : Types.Actor.IndexServiceActor = actor (index_service);
		await index_service_actor.get_data_segmentation();
	};

	public composite query func get_packages_by_criteria(criteria:Types.SearchCriteriaArgs) : async  [Conversion.BundlePackageView] {
		let index_service_actor : Types.Actor.IndexServiceActor = actor (index_service);
		
		let by_country = switch (criteria.country_code) {
			case (?country_code) { await index_service_actor.get_packages_by_country(country_code)};
			case (null) {[]};
		};		
		let by_tag = switch (criteria.tag) {
			case (?tag) { await index_service_actor.get_packages_by_tag(tag)};
			case (null) {[]};
		};
		let by_class = switch (criteria.classification) {
			case (?classification) { await index_service_actor.get_packages_by_classification(classification)};
			case (null) {[]};
		};
		_get_packages(Utils.build_uniq([by_country, by_tag, by_class]));
	};

	public query func get_index_service() : async Text {
		return index_service;
	};				

    private func _get_packages(ids:[Text]) : [Conversion.BundlePackageView] {
		let res = Buffer.Buffer<Conversion.BundlePackageView>(Array.size(ids));
		for (id in ids.vals()) {
			switch (package_get(id)) {
				case (?package) { res.add(Conversion.convert_package_view(id, package)); };
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
		if (CommonUtils.identity_equals(identity, owner)) return true;
		// check access list
		return Option.isSome(List.find(access_list , CommonUtils.find_identity(identity)));
    };

	private func _is_operator (identity : CommonTypes.Identity) : Bool {
		Option.isSome(List.find(access_list , CommonUtils.find_identity(identity)));
    };

}