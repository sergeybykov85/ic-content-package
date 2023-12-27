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

import CommonTypes "../shared/CommonTypes";
import CommonUtils "../shared/CommonUtils";

import Types "./Types";
import BundlePackage "../content-bundle/BundlePackage";

shared (installation) actor class PackageService(initArgs : Types.PackageServiceArgs) = this {

	let DEF_PACKAGE_CYCLES:Nat = 2_000_000_000_000;

	// immutable field
	let CREATOR:CommonTypes.Identity = {
		identity_type = #ICP;
		identity_id = Principal.toText(installation.caller);
	};
	// registry actor
	let REGISTRY:Text = Option.get(initArgs.package_registry, "LOC");

    stable var owner:CommonTypes.Identity = Option.get(initArgs.owner, {
		identity_type = #ICP; identity_id = Principal.toText(installation.caller) 
	});

	stable let NETWORK = initArgs.network;

	// who can manage service, register new allowance or remove it
	stable var access_list : List.List<CommonTypes.Identity> = List.nil();

    // all allowances, key - identity, value - allowance
    stable var allowance : Trie.Trie<Text, Types.Allowance> = Trie.empty();

    // all counters, key - identity, value - counter
    stable var counter : Trie.Trie<Text, Types.Counter> = Trie.empty();	

	stable var total : Nat = 0;

    private func allowance_get(identity : CommonTypes.Identity) : ?Types.Allowance = Trie.get(allowance, CommonUtils.identity_key(identity), Text.equal);
	
	private func counter_get(identity : CommonTypes.Identity) : ?Types.Counter = Trie.get(counter, CommonUtils.identity_key(identity), Text.equal);


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
	* Registers an allowance
	*/
	public shared ({ caller }) func register_allowance (args : Types.AllowanceArgs) : async Result.Result<(), CommonTypes.Errors> {
		if (not can_manage(caller)) return #err(#AccessDenied);
		switch (allowance_get(args.identity)) {
			case (?allowance) { return #err(#DuplicateRecord); };
			case (null) {
				allowance := Trie.put(allowance, CommonUtils.identity_key(args.identity), Text.equal, {
					allowed_packages = args.allowed_packages;
					var created_packages = 0;
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
	* Deploys a public package
	*/
	public shared ({ caller }) func deploy_public_package (metadata:Types.MetadataArgs, identifier_type : ?Types.Identifier) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		switch (allowance_get(identity)) {
			case (?allowance) {
				// any extra resticitons could be added based on the package type
				if (allowance.allowed_packages == 0)  return #err(#AccessDenied);
				await _deploy_package({
					mode  = { submission = #Public; identifier = Option.get(identifier_type, #Ordinal);	};
					caller = identity;
					owner = identity;
					metadata = ?metadata;
					contributors = null;
					cycles = ?DEF_PACKAGE_CYCLES;
				});
			};
			case (null) { return #err(#AccessDenied); };
		}
	};

	/**
	* Deploys a private package
	*/
	public shared ({ caller }) func deploy_private_package (metadata:Types.MetadataArgs, identifier_type : ?Types.Identifier) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		switch (allowance_get(identity)) {
			case (?allowance) {
				// any extra resticitons could be added based on the package type
				if (allowance.allowed_packages == 0)  return #err(#AccessDenied);
				await _deploy_package({
					mode  = { submission = #Private; identifier = Option.get(identifier_type, #Ordinal); };
					owner = identity;
					metadata = ?metadata;
					contributors = null;
					cycles = ?DEF_PACKAGE_CYCLES;
				});
			};
			case (null) { return #err(#AccessDenied); };
		}
	};

	/**
	* Deploys a shared package. Parameter contributors allows to specify list of users who can create bundles inside the package
	*/
	public shared ({ caller }) func deploy_shared_package (metadata:Types.MetadataArgs, contributors:[CommonTypes.Identity], identifier_type : ?Types.Identifier) : async Result.Result<Text, CommonTypes.Errors> {
		let identity = _build_identity(caller);
		switch (allowance_get(identity)) {
			case (?allowance) {
				if (allowance.allowed_packages == 0)  return #err(#AccessDenied);
				await _deploy_package({	
					mode  = { submission = #Private; identifier = Option.get(identifier_type, #Ordinal); };
					owner = identity;
					metadata = ?metadata;
					contributors = ?contributors;
					cycles = ?DEF_PACKAGE_CYCLES;
				});
			};
			case (null) { return #err(#AccessDenied); };
		}
	};	

	private func _deploy_package (args : Types.PackageCreationRequest) : async Result.Result<Text, CommonTypes.Errors> {
		let registry_actor : Types.Actor.PackageRegistryActor = actor (REGISTRY);
		// if the caller is able to register any package
		if  (not (await registry_actor.is_submitter({identity_type=#ICP; identity_id=Principal.toText(Principal.fromActor(this)) }))) { return #err(#AccessDenied); };
		Cycles.add(Option.get(args.cycles, DEF_PACKAGE_CYCLES));
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
		let package_id = Principal.fromActor(bundle_package_actor);
		switch (await bundle_package_actor.init_data_store(null)) {
			// ignore in case of success
			case (#ok(_)) {};
			case (#err(e)) { return #err(#ActionFailed)};};

		// register package
		let registration_response = await registry_actor.register_package(package_id);
		switch (registration_response) {
			case (#ok(_)) {
				// update index
				switch (counter_get(owner)) { 
					case (?c) {	c.created_packages:=c.created_packages + 1; };
					case (null) {
						counter := Trie.put(counter, CommonUtils.identity_key(owner), Text.equal, {var created_packages = 1}).0;
					};
				};
				total:=total + 1;
				#ok(Principal.toText(package_id));
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

	public query func total_supply() : async Nat {
		return total;
	};

	public query func total_supply_by(identity:CommonTypes.Identity) : async Nat {
		switch (counter_get(identity)) {
			case (?c) {c.created_packages};
			case (null) {0};
		};
	};

	public query func allowance_by(identity:CommonTypes.Identity) : async Nat {
		switch (allowance_get(identity)) {
			case (?c) {c.allowed_packages};
			case (null) {0};
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