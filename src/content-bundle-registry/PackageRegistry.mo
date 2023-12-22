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

import Debug "mo:base/Debug";

import Http "../shared/Http";
import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";

import Types "./Types";
import Conversion "./Conversion";

shared (installation) actor class PackageRegistry(initArgs : Types.PackageRegistryArgs) = this {

	// immutable field
	let CREATOR:CommonTypes.Identity = {
		identity_type = #ICP;
		identity_id = Principal.toText(installation.caller);
	};

    stable var owner:CommonTypes.Identity = Option.get(initArgs.owner, {
		identity_type = #ICP; identity_id = Principal.toText(installation.caller) 
	});

	stable let NETWORK = initArgs.network;

	// who can manage providers
	stable var access_list : List.List<CommonTypes.Identity> = List.nil();

	// crreator of the package
    stable var creator2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

	// who submitted a package : service or channel partner
    stable var provider2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

	// all registered packages, order is maintaited
	stable var all_packages : List.List<Text> = List.nil();	

    // all providers, key - identity
    stable var providers : Trie.Trie<Text, Types.Provider> = Trie.empty();

    // all packages, key - principal id
    stable var packages : Trie.Trie<Text, Types.BundlePackage> = Trie.empty();

    private func creator2package_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(creator2package, CommonUtils.identity_key(identity), Text.equal);

    private func provider2package_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(provider2package, CommonUtils.identity_key(identity), Text.equal);

    private func package_get(id : Text) : ?Types.BundlePackage = Trie.get(packages, CommonUtils.text_key(id), Text.equal);

    private func provider_get(identity : CommonTypes.Identity) : ?Types.Provider = Trie.get(providers, CommonUtils.identity_key(identity), Text.equal);


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
	* Registerrs a new package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func register_provider (args : Types.CommonArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (provider_get(args.identity)) {
			case (?customer) { return #err(#DuplicateRecord); };
			case (null) {
				let provider : Types.Provider = {
					var name = args.name;
					var description = args.description;
					identity = args.identity;
					var packages = List.nil();
					created = Time.now();
				};
				providers := Trie.put(providers, CommonUtils.identity_key(args.identity), Text.equal, provider).0;
				#ok();
			}
		};
	};
	/**
	* Removes an existing package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func remove_provider (identity : CommonTypes.Identity) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (provider_get(identity)) {
			case (null) { return #err(#NotFound); };
			case (?customer) {
				providers := Trie.remove(providers, CommonUtils.identity_key(identity), Text.equal).0; 
				#ok();
			}
		}
	};
	/**
	* Updates an existing package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func update_provider (args : Types.CommonUpdateArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (provider_get(args.identity)) {
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
	* Registerrs a new package provider (who is authorized to add new packages)
	*/
	public shared ({ caller }) func register_package (args : Types.PackageRequestArgs) : async Result.Result<(), CommonTypes.Errors> {
		let identity = _build_identity(caller);
		switch (provider_get(identity)) {
			case (?provider) {
				let package_id = Principal.toText(args.package);
				switch (package_get(package_id)) {
					case (?pack) {return #err(#DuplicateRecord)};
					case (null) {

						let package_actor : Types.Actor.BundlePackageActor = actor (package_id);
						let package_creator = await package_actor.get_creator();

						packages := Trie.put(packages, CommonUtils.text_key(package_id), Text.equal, {
							var name = args.name;
							var description = args.description;
							var urls = List.fromArray(args.urls);
							created = Time.now();
						}:Types.BundlePackage).0;

						provider.packages:=List.push(package_id, provider.packages);
						// index for all packages
						all_packages:= List.push(package_id, all_packages);
						// index for provider
						switch (provider2package_get(identity)) {
							case (?by_provider) {provider2package := Trie.put(provider2package, CommonUtils.identity_key(identity), Text.equal, List.push(package_id, by_provider)).0; };
							case (null) {provider2package := Trie.put(provider2package, CommonUtils.identity_key(identity), Text.equal, List.push(package_id, List.nil())).0;}
						};
						// index for creator
						switch (creator2package_get(identity)) {
							case (?by_creator) {creator2package := Trie.put(provider2package, CommonUtils.identity_key(identity), Text.equal, List.push(package_id, by_creator)).0; };
							case (null) {creator2package := Trie.put(provider2package, CommonUtils.identity_key(identity), Text.equal, List.push(package_id, List.nil())).0;}
						};						
						return #ok();
					};
				};
			};
			case (null) { return #err(#AccessDenied); };
		}
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

	/**
	* Returns packages for the provider
	*/
    public query func get_packages_for_provider(identity:CommonTypes.Identity) : async [Conversion.BundlePackageView] {
		switch (provider2package_get(identity)) {
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

    public query func get_package_ids () : async [Text] {
		List.toArray(all_packages);
    };	

    public query func get_packages(ids:[Text]) : async [Conversion.BundlePackageView] {
		_get_packages(ids);
    };

	public query func total_supply() : async Nat {
		return Trie.size(packages);
	};

	public query func total_supply_by_creator(identity:CommonTypes.Identity) : async Nat {
		switch (creator2package_get(identity)) {
			case (?ids) {List.size(ids)};
			case (null) {0};
		};
	};

	public query func total_supply_by_provider(identity:CommonTypes.Identity) : async Nat {
		switch (creator2package_get(identity)) {
			case (?ids) {List.size(ids)};
			case (null) {0};
		};
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
		return Option.isSome(List.find(access_list , func (k:CommonTypes.Identity):Bool { CommonUtils.identity_equals(identity, k)}));
    };

	private func _is_operator (identity : CommonTypes.Identity) : Bool {
		Option.isSome(List.find(access_list , func (k:CommonTypes.Identity):Bool { CommonUtils.identity_equals(identity, k)}));
    };

/*	private func _is_operator(id: Principal) : Bool {
    	Option.isSome(Array.find(operators, func (x: Principal) : Bool { x == id }))
    };	
*/
}