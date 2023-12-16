import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";

import CommonTypes "../shared/CommonTypes";

module {

	public type RequestedObject = {
		id : Text;
		view_mode : ViewMode;
		route : Route;
		tag : ?Text;
	};	

	public type Route = {
		#Bundle;
		#Logo;     
		#POI;     
	};	

	public type ViewMode = {
		#Index;     // index, names could be used as a part of browser url
		#Open;      // references to the resource by its hash
	};

	public type DataStore = {
		var buckets : List.List<Text>;
		var active_bucket : ?Text;
		// only incremented
		var bucket_counter: Nat;
		created : Time.Time;
		var last_update : ?Time.Time;
	};

	public type DataStoreView = {
		buckets : [Text];
		active_bucket : Text;
		last_update : Time.Time;
	};	

	public type Network = {
        #IC;
        #Local: Text; // host details like localhost:4943
    };

	// mode governs the behavior who can create new bundle
	public type SubmissionMode = {
		#Installer; 
		#Public;
		#ACL;
	};
	// mode governs the identifier style for new bundle
	public type IdentifierMode = {
		#Ordinal;
		#Hash;
	};
	// mode governs the behaviour if bundle can be removed or not
	public type DeleteMode = {
		#Deletable;
		#NonDeletable;
	};

	public type Modes = {
		submission : SubmissionMode;
		identifier : IdentifierMode;
		deletion :  DeleteMode;
	};

	public let DEFAULT_MODE : Modes = {
		submission = #Public;
		identifier = #Hash;
		deletion = #Deletable;
	};

	public type DataPackageAction = {
		#Upload;
		#UploadChunk;
		#Package;
	};

	public type DataPayload = {
		value : Blob;
		content_type : ?Text;
	};

	public type ChunkUploadAttempt = {
		// needed to complete batch upload
		binding_key : Text;
		locale : ?Text;
		created : Time.Time;
	};

	public type DataSection = {
		data_path : CommonTypes.ResourcePath;
		category : CommonTypes.CategoryId;
		var data: List.List<CommonTypes.ResourcePath>;
		var active_upload : ?ChunkUploadAttempt;
		var counter: Nat;
	};

	// represents a space for logically grouped sections
	public type DataGroup = {
		// name for internal management.
		data_path : CommonTypes.ResourcePath;
		var sections: List.List<DataSection>;
		var readonly : ?Nat;
		var access_list : List.List<CommonTypes.Identity>;
		created : Time.Time;
	};

	public type BundlePayload = {
		var poi_group : ?DataGroup;
		var additions_group : ?DataGroup;
	};

	public type Bundle = {
		// path to the root data partition
		data_path : CommonTypes.ResourcePath;
		var name : Text;
		var description : Text;
		// simple light weigh logo
		var logo : ?CommonTypes.ResourcePath;
		var tags : List.List<Text>;
		// payload
		var payload : BundlePayload;
		creator : CommonTypes.Identity;
		var owner : CommonTypes.Identity;
		// modifications! query is available for all, forever
		var access_list : List.List<CommonTypes.Identity>;
		created : Time.Time;
	};

	public type BundleArgs = {
		name : Text;
		description : Text;
		logo : ?DataPayload;
		tags : [Text];
	};

	public type DataFreezeArgs = {
		groups : [CommonTypes.DataGroupId];
		period_sec : ?Nat
	};

	public type DataPathArgs = {
		group : CommonTypes.DataGroupId;
		category : ?CommonTypes.CategoryId;
	};	

	public type DataAccessListArgs = {
		// if not specified, then apply on the bucket
		group : ?CommonTypes.DataGroupId;
		// list to apply
		access_list : [CommonTypes.Identity];
	};

	public type DataRequest<T> = {
		group: CommonTypes.DataGroupId;
		category : CommonTypes.CategoryId;
		name : ?Text;
		locale : ?Text;
		payload : T;
		action : DataPackageAction;
	};

	public type DataPackageRawArgs = DataRequest<DataPayload>;

	public type DataPackageArgs = DataRequest<CommonTypes.Serialization.StructureArgs>;

	public type BundleUpdateArgs = {
		name : ?Text;
		description : ?Text;
		logo : ?DataPayload;
		tags : ?[Text];
	};		

	// input arguments to install a new BundlePackage actor
	public type BundlePackageArgs = {
		network : Network;
		// operators to work with a bundle application
		operators : [Principal];
		// modes
		modes : ?Modes;
		bucket_cycles : ?Nat;
	};

	// BundlePackage metadata
	public type BundlePackageMetadata = {
		id : Principal;
		name : Text;
		description: Text;
		image : Text;
		owner : Principal;
		created : Time.Time;
	};

	/**
	Module to inter-canister calls
	*/
	public module Actor {

		public type IdUrl = {
			id : Text;
			url : Text;
			// usually it is a bucket
			partition : Text;
		};

		public type ResourceAction = {
			#Copy;
			#Delete;
			#Rename;
			#TTL;
			#Replace;
			#ReadOnly;
			#HttpHeaders;
		};		

		public type ResourceArgs = {
			content_type : ?Text;
			name : Text;
			// input argument, directory name
			parent_path : ?Text;
			// direcotry id. It has a precedence over the parent_path, but this field is not supported in all methods
			parent_id : ?Text;
			ttl : ?Nat;
			read_only : ?Nat;
		};

    	public type ICSettingsArgs = {
        	controllers : ?[Principal];
   	 	};

		public type DataBucketActor = actor {
			new_directory : shared (break_on_duplicate:Bool, args : ResourceArgs) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			apply_html_resource_template : shared (template : ?Text) -> async Result.Result<(), CommonTypes.Errors>;
			apply_cleanup_period : shared (seconds : Nat) -> async Result.Result<(), CommonTypes.Errors>;
			store_resource : shared (content : Blob, resource_args : ResourceArgs ) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			replace_resource : shared (id :Text, content : Blob) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			delete_resource : shared (id : Text) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			readonly_resource : shared (id : Text, read_only : ?Nat) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			store_chunk : shared (content : Blob, binding_key : ?Text) -> async Result.Result<Text, CommonTypes.Errors>;
			commit_batch_by_key : shared (binding_key : Text, resource_args : ResourceArgs) -> async Result.Result<IdUrl, CommonTypes.Errors>;		
		};

    	public type ICManagementActor = actor {
        	stop_canister : shared { canister_id : Principal } -> async ();
			delete_canister : shared { canister_id : Principal } -> async ();
        	update_settings : shared {
            	canister_id : Principal;
            	settings : ICSettingsArgs;
        	} -> async ();
    	};

		public type Wallet = actor {
    		wallet_receive : () -> async ();
			withdraw_cycles : shared {to : Principal; remainder_cycles : ?Nat} -> async ();
    	};		
	};
	///

};
