import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";

module {

	public type AccessList = {owner : Principal; operators : [Principal]};

	public type Location = {country_code2:Text; region:?Text; city:?Text; coordinates:?Coordinates};

	public type Coordinates = {latitude : Float; longitude : Float};
	//public type LocationText = {latitude : Text; longitude : Text};
	public type Attribute = {trait_type:Text; value:Text;};
	public type ResourcePath = {locale:?Text; url : Text; bucket_id:Text; resource_id: Text;};

	public type IdentityType = {
		#ICP;
		#EvmChain; 
	};

	public type Identity = {
		identity_type : IdentityType;
		identity_id : Text;
	};

	public type IdentityAccess = {
		identity : Identity;
	};


	public type NameValue = {
		name : Text;
		value : Text;
	};

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

	public type DataGroupId = {
		#POI;
		#Additions;
	};

	public type ItemCategory = {
		#POI;
		#About;
		#AudioGuide;
		#Music;
		#Video;
		#Image;
		#Article;
		#Document;
		#AR;
		#Sundry;
	};

	public type DataPayload = {
		value : Blob;
		content_type : ?Text;
	};

	public type PayloadFormat = {
		#Json;
		#Binary;
	};

	public type UploadOptions = {
		replace_path : ?ResourcePath;
		keys : ?[Text];
		format : PayloadFormat;
	};

	public type ChunkUploadAttempt = {
		// needed to complete batch upload
		binding_key : Text;
		locale : ?Text;
		created : Time.Time;
	};

	public type DataSection = {
		category : ItemCategory;
		var data: List.List<ResourcePath>;
		var active_upload : ?ChunkUploadAttempt;
	};

	public type DataSectionView = {
		category : ItemCategory;
		data: [ResourcePath];
	};	

	// represents a single resource (POI or an Addition object)
	public type DataItem = {
		// name for internal management.
		var name : Text;
		var location: ?Location;
		// various sections. They might be filled depending on the category
		var data : ResourcePath;
		var sections: List.List<DataSection>;
		owner : Identity;
		created : Time.Time;

	};

	public type DataItemView = {
		// name for internal management.
		name : Text;
		location: ?Location;
		data : ResourcePath;
		sections: [DataSectionView];
		owner : Identity;
		created : Time.Time;
	};

	// represents a space for logically grouped sections
	public type DataGroup = {
		// name for internal management.
		data_path : ResourcePath;
		var sections: List.List<DataSection>;
		created : Time.Time;
	};

	public type DataGroupView = {
		// name for internal management.
		data_path : ResourcePath;
		sections: [DataSectionView];
	};		

	public type BundlePayload = {
		var poi_group : ?DataGroup;
		var additions_group : ?DataGroup;
	};

	public type Bundle = {
		// path to the root data partition
		data_path : ResourcePath;
		var name : Text;
		var description : Text;
		// simple light weigh logo
		var logo : ?ResourcePath;
		var tags : List.List<Text>;
		// payload
		var payload : BundlePayload;
		owner : Identity;
		
		created : Time.Time;
	};

	public type BundleArgs = {
		name : Text;
		description : Text;
		logo : ?DataPayload;
		tags : [Text];
	};

	public type DataPackageArgs = {
		category : ItemCategory;
		locale :? Text;
		payload : DataPayload;
		action : DataPackageAction;
	};	

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

	
	public type Errors = {
		// data store is not initialized
		#DataStoreNotInitialized;
		// no resource or no chunk
		#NotFound;
		// record already registered
		#DuplicateRecord;
		// action not allowed by the logic or constraints
        #OperationNotAllowed;
        // not registered
        #NotRegistered;
		// when input argument contains wrong value
		#InvalidRequest;
        // exceeded allowed items
        #ExceededAllowedLimit;	
		// not authorized to manage certain object
		#AccessDenied;
		// no resource or no chunk
		#ActionFailed;	
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
			new_directory : shared (break_on_duplicate:Bool, args : ResourceArgs) -> async Result.Result<IdUrl, Errors>;
			apply_html_resource_template : shared (template : ?Text) -> async Result.Result<(), Errors>;
			apply_cleanup_period : shared (seconds : Nat) -> async Result.Result<(), Errors>;
			store_resource : shared (content : Blob, resource_args : ResourceArgs ) -> async Result.Result<IdUrl, Errors>;
			replace_resource : shared (id :Text, content : Blob) -> async Result.Result<IdUrl, Errors>;
			delete_resource : shared (id : Text) -> async Result.Result<IdUrl, Errors>;
			store_chunk : shared (content : Blob, binding_key : ?Text) -> async Result.Result<Text, Errors>;
			commit_batch_by_key : shared (binding_key : Text, resource_args : ResourceArgs) -> async Result.Result<IdUrl, Errors>;		
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

	/**
	Module to represents json objects
	*/
	public module Serialization {
		public let POI_GENERAL_FIELDS = ["name", "value", "category", "location", "latitude", "longitude", "attributes", "owner", "country_code2", "region", "city", "coordinates"];
		public let POI_ABOUT_FIELDS = ["name", "value", "attributes", "locale", "short_description", "description"];
		public type POIArgs = {
			general : POIDataJson;
			about : ?[ItemAboutDataJson];
		};
		public type POIUpdateArgs = {
			general : ?POIDataJson;
			about : ?[ItemAboutDataJson];
		};		
		public type POIDataJson = {
			name : Text;
			location: Location;
			attributes : [NameValue];
		};

		public type ItemAboutDataJson = {
			name : Text;
			short_description : ?Text;
			description : Text;
			locale : Text;
			attributes : [NameValue];
		};	
	};
	///	


};
