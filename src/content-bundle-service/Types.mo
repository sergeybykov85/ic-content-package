import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Trie "mo:base/Trie";

import CommonTypes "../shared/CommonTypes";
import BundlePackage "../content-bundle/BundlePackage";

module {

	public type Submission = {
		#Private; 
		#Public;
		#Shared;
	};

	public type Identifier = {
		#Ordinal;
		#Hash;
	};	

	public type Mode = {
		submission : Submission;
		identifier : Identifier;
		// max total supply
		max_supply : ?Nat;
		// max supply per creator
		max_creator_supply : ?Nat;
		// max tags per a bundle
		max_tag_supply : ?Nat;
	};

	public type PackageCreationRequest = {
		mode : {
			submission : Submission;
			identifier : Identifier;
			// max total supply
			max_supply : ?Nat;
			// max supply per creator
			max_creator_supply : ?Nat;
			// max tags per a bundle
			max_tag_supply : ?Nat;
		};
		owner : CommonTypes.Identity;
		metadata : ?MetadataArgs;
		contributors : ?[CommonTypes.Identity];
		cycles : ?Nat;
	};

	public type MetadataArgs = {
		name : Text;
		description : Text;
		logo : ?DataRawPayload;
	};

	public type PackageOptions = {
		max_creator_supply : ?Nat; 
		max_supply : ?Nat;
		max_tag_supply : ?Nat;
		identifier_type : ?Identifier;
	};

	public type DataRawPayload = {
		value : Blob;
		content_type : ?Text;
	};	

	public type PackageServiceArgs = {
		network : CommonTypes.Network;
		package_registry : ?Text;
		// target owner. If not specified, then onwer = who installs the canister
		owner : ?CommonTypes.Identity;
	};

	public type PackageRequestArgs = {
		package : Principal;
		references : [CommonTypes.NameValue];
	};
	

	public type AllowanceArgs = {
		identity : CommonTypes.Identity;
		allowed_packages : Nat;
	};	

	public type Allowance = {
		allowed_packages : Nat;
	};

	public type Activity = {
		// deployed packages
		deployed_packages : [Text];
		allowance : Nat;
	};

	/**
		Module to inter-canister calls
	*/
	public module Actor {

		public type PackageDetails = {
			submission : Submission;
			creator : CommonTypes.Identity;
			owner : CommonTypes.Identity;
			created : Int;
			total_bundles : Nat;
			name : Text;
			description : Text;
			logo_url : ?Text;
		};
	
		public type PackageRegistryActor = actor {
			is_submitter : shared(identity:CommonTypes.Identity)  -> async Bool;
			register_package : shared(package : Principal)  -> async Result.Result<Text, CommonTypes.Errors>;
		};		

		public type BundlePackageActor = actor {
			transfer_ownership : shared (identity:CommonTypes.Identity)  -> async Result.Result<(), CommonTypes.Errors>;
			init_data_store : shared (cycles : ?Nat) -> async Result.Result<Text, CommonTypes.Errors>;
			apply_contributors : shared (contributors: [CommonTypes.Identity])  -> async Result.Result<(), CommonTypes.Errors>;
		};

    	public type ICActor = actor {
        	stop_canister : shared { canister_id : Principal } -> async ();
			delete_canister : shared { canister_id : Principal } -> async ();
        	update_settings : shared {
            	canister_id : Principal;
            	settings : {controllers : ?[Principal]; };
        	} -> async ();
    	};		
	};
};
