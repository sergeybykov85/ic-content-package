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

import Types "./Types";
import BundlePackage "../content-bundle/BundlePackage";

import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";


shared (installation) actor class PackageService(initArgs : Types.PackageServiceArgs) = this {
	// def cycles for the package canister creation
	let DEF_PACKAGE_CYCLES:Nat = 1_000_000_000_000;
	// def cycles for  the databucket crreation when a new package is deployed
	let DEF_DATASTORE_CYCLES:Nat = 600_000_000_000;
	let DEF_MINIMUM_REMAINING_CYCLES:Nat = 5_000_000_000_000;
	
	// management actor
	let IC : Types.Actor.ICActor = actor "aaaaa-aa";

	// Max tag supply per a bundle
	let MAX_TAG_SUPPLY = 5;

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

	// trial allowance -- minimum number of packages to deploy even if allowances is not set. This is controlled by access_list.
	stable var trial_allowance : Nat = 0;

	// who can manage service, register new allowance or remove it
	stable var access_list : List.List<CommonTypes.Identity> = List.nil();

    // all allowances, key - identity, value - allowance
    stable var allowance : Trie.Trie<Text, Types.Allowance> = Trie.empty();

	// identity to deployed package.
	/**
	* Package registry contains the global mapping. More that one service can register packages.
	* But the meaning of creator2package here is activity inside the package service
	*/
    stable var creator2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();	

	stable var total : Nat = 0;

	private func creator2package_get(identity : CommonTypes.Identity) : ?List.List<Text> = Trie.get(creator2package, CommonUtils.identity_key(identity), Text.equal);

    private func allowance_get(identity : CommonTypes.Identity) : ?Types.Allowance = Trie.get(allowance, CommonUtils.identity_key(identity), Text.equal);
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
	* Change the package registry
	*/
	public shared ({ caller }) func apply_registry (to : Principal) : async Result.Result<(), CommonTypes.Errors> {
		if (not CommonUtils.identity_equals({identity_type = #ICP; identity_id = Principal.toText(caller);}, owner)) return #err(#AccessDenied);
		registry := Principal.toText(to);
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
					allowed_packages = args.allowed_packages;
				}).0;
				#ok();
			}
		};
	};

	/**
	* Applies the trial allowance
	*/
	public shared ({ caller }) func apply_trial_allowance (v : Nat) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		trial_allowance := v;
		#ok();
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
	* Deploys a public package
	*/
	public shared ({ caller }) func deploy_public_package (metadata:Types.MetadataArgs, options: ?Types.PackageOptions) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		let act : Types.Activity = _activity_by(identity);
		if (act.allowance == 0)  return #err(#AccessDenied);
		if ((Array.size(act.deployed_packages)) >= act.allowance)  return #err(#LimitExceeded);
		await _deploy_package({
			mode  = { submission = #Public; 
				identifier = switch (options) {
					case (?opt) {Option.get(opt.identifier_type, #Ordinal)};
					case (null) {#Ordinal};
				};
				max_supply = switch (options) {
					case (?opt) {opt.max_supply};
					case (null) {null};
				}; 
				max_creator_supply = switch (options) {
					case (?opt) {opt.max_creator_supply};
					case (null) {null};
				};
				max_tag_supply = switch (options) {
					case (?opt) {opt.max_tag_supply};
					case (null) {?MAX_TAG_SUPPLY};
				}
			};
			caller = identity;
			owner = identity;
			metadata = ?metadata;
			contributors = null;
			cycles_package = null;
			cycles_datastore = null;
		});
	};

	/**
	* Deploys a private package
	*/
	public shared ({ caller }) func deploy_private_package (metadata:Types.MetadataArgs, options: ?Types.PackageOptions) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		let act : Types.Activity = _activity_by(identity);
		if (act.allowance == 0)  return #err(#AccessDenied);
		if (Array.size(act.deployed_packages) >= act.allowance)  return #err(#LimitExceeded);
		await _deploy_package({
			mode  = {
				submission = #Private; 
				identifier = switch (options) {
					case (?opt) {Option.get(opt.identifier_type, #Ordinal)};
					case (null) {#Ordinal};
				};
				max_supply = switch (options) {
					case (?opt) {opt.max_supply};
					case (null) {null};
				}; 
				max_creator_supply = null;
				max_tag_supply = switch (options) {
					case (?opt) {opt.max_tag_supply};
					case (null) {?MAX_TAG_SUPPLY};
				}
			};
			owner = identity;
			metadata = ?metadata;
			contributors = null;
			cycles_package = null;
			cycles_datastore = null;
		});
	};

	/**
	* Deploys a shared package. Parameter contributors allows to specify list of users who can create bundles inside the package
	*/
	public shared ({ caller }) func deploy_shared_package (metadata:Types.MetadataArgs, contributors:[CommonTypes.Identity], options: ?Types.PackageOptions) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		let act : Types.Activity = _activity_by(identity);
		if (act.allowance == 0)  return #err(#AccessDenied);
		if (Array.size(act.deployed_packages) >= act.allowance)  return #err(#LimitExceeded);		
		await _deploy_package({	
			mode  = {
				submission = #Shared; 
				identifier = switch (options) {
					case (?opt) {Option.get(opt.identifier_type, #Ordinal)};
					case (null) {#Ordinal};
				};
				max_supply = switch (options) {
					case (?opt) {opt.max_supply};
					case (null) {null};
				}; 
				max_creator_supply = null;
				max_tag_supply = switch (options) {
					case (?opt) {opt.max_tag_supply};
					case (null) {?MAX_TAG_SUPPLY};
				}
			};
			owner = identity;
			metadata = ?metadata;
			contributors = ?contributors;
			cycles_package = null;
			cycles_datastore = null;
		});
	};	

	private func _deploy_package (args : Types.PackageCreationRequest) : async Result.Result<Text, CommonTypes.Errors> {
		let registry_actor : Types.Actor.PackageRegistryActor = actor (registry);
		// if the caller is able to register any package
		if  (not (await registry_actor.is_submitter({identity_type=#ICP; identity_id=Principal.toText(Principal.fromActor(this)) }))) { return #err(#AccessDenied); };
		let cycles_p = Option.get(args.cycles_package, DEF_PACKAGE_CYCLES);
		let cycles_store = Option.get(args.cycles_datastore, DEF_DATASTORE_CYCLES);
		// cycles to allocate a datastore is taken from the package. cycles_p must be > than cycles_store
		if (cycles_store > cycles_p)  return #err(#InvalidRequest);
		// reject request if fuel is not enough
		if ((cycles_p + DEF_MINIMUM_REMAINING_CYCLES)  >  Cycles.balance()) return #err(#FuelNotEnough); 

		Cycles.add(cycles_p);
		// deploy package
		let bundle_package_actor = await BundlePackage.BundlePackage({
			// apply the user account as operator of the bucket
			mode = ?args.mode;
			owner = ?args.owner;
			network = initArgs.network;
			metadata = args.metadata;
			contributors = args.contributors
		});

		// init data store
		let package_principal = Principal.fromActor(bundle_package_actor);
		switch (await bundle_package_actor.init_data_store(?cycles_store)) {
			// ignore in case of success
			case (#ok(_)) {};
			case (#err(e)) { return #err(#ActionFailed)};
		};

		// apply controller for the new package
		switch (owner.identity_type) {
			case (#ICP) {
				// right now the user becomes the controller of the canisterr and the service canister as well.
				// but it is ok to remove the service canister from the controller list LATER.
				ignore IC.update_settings({
					canister_id =  Principal.fromActor(bundle_package_actor);
					settings = { controllers = ? [ Principal.fromText(owner.identity_id), Principal.fromActor(this)]};
				});	
			};
			case (_) {};
		};

		// register package
		let registration_response = await registry_actor.register_package(package_principal, ?args.owner);
		switch (registration_response) {
			case (#ok(package_id)) {
				total:=total + 1;

				// index for creator
				switch (creator2package_get(args.owner)) {
					case (?by_creator) {creator2package := Trie.put(creator2package, CommonUtils.identity_key(args.owner), Text.equal, List.push(package_id, by_creator)).0; };
					case (null) {creator2package := Trie.put(creator2package, CommonUtils.identity_key(args.owner), Text.equal, List.push(package_id, List.nil())).0;}
				};
				// Principal.toText(package_principal) = package_id
				#ok(package_id);
			};
			case (#err(_)) { return #err(#ActionFailed); };
		};
	};	

	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept(amount);
  	};
	
	public query func available_cycles() : async Nat {
		return Cycles.balance();
  	};

	public query func get_trial_allowance() : async Nat {
		return trial_allowance;
  	};

	public query func total_supply() : async Nat {
		return total;
	};

	public query func get_registry() : async Text {
		return registry;
	};	

	public query func total_supply_by(identity:CommonTypes.Identity) : async Nat {
		switch (creator2package_get(identity)) {
			case (?c) {List.size(c)};
			case (null) {0};
		};
	};

    public query func get_package_ids_by(identity:CommonTypes.Identity) : async [Text] {
		switch (creator2package_get(identity)) {
			case (?ids) { List.toArray(ids) };
			case (null) { [] };
		};
    };	

	public query func allowance_by(identity:CommonTypes.Identity) : async Nat {
		switch (allowance_get(identity)) {
			case (?c) {c.allowed_packages};
			case (null) {trial_allowance};
		};
	};

	public query func activity_by(identity:CommonTypes.Identity) : async Types.Activity {
		_activity_by(identity);
	};

	private func _activity_by(identity:CommonTypes.Identity) : Types.Activity {
		let allowance = switch (allowance_get(identity)) {
			case (?c) {c.allowed_packages};
			case (null) {trial_allowance};
		};
		{ deployed_packages = switch (creator2package_get(identity)) {
			case (?c) {List.toArray(c)};
			case (null) {[]};
		}; allowance = allowance;
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
		if (CommonUtils.identity_equals(identity, owner)) return true;
		// check access list
		return Option.isSome(List.find(access_list , CommonUtils.find_identity(identity)));
    };

}