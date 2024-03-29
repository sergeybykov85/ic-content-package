import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";

import CommonTypes "../shared/CommonTypes";

module {

	public class DataShema(group_id : CommonTypes.DataGroupId, categories : [CommonTypes.CategoryId]) {
		
		public func get_group_id () : CommonTypes.DataGroupId = group_id;
		
		public func get_categories () : [CommonTypes.CategoryId] = categories;

    	public func resolve_resource_name (category: CommonTypes.CategoryId, locale: ?Text) : Text {
        	var suffix = switch (locale) {
            	case (?loc) {"_"#loc};
            	case (null) {""};
        	};

        	switch (category) {
            	case (#Location) { "location"#suffix#".json";};
            	case (#About) { "about"#suffix#".json";};
				case (#History) { "history"#suffix#".json";};
            	case (#AudioGuide) { "audio_guide"#suffix;};
            	case (#Audio) { "track"#suffix;};
            	case (#Video) { "video"#suffix;};
            	case (#Gallery) { "img"#suffix;};
            	case (#Article) { "index"#suffix#".html";};     
            	case (#Document) { "file"#suffix;};
            	case (_) { "res"#suffix;};
        	};
    	};

    	public func resolve_group_name () : (Text) {
        	switch (group_id) {
            	case (#POI) { "poi"};
            	case (#Additions) {"additions"};
        	};
    	};

    	public func resolve_category_name (category: CommonTypes.CategoryId) : (Text) {
        	switch (category) {
            	case (#Location) { "location"};
            	case (#About) {"about"};
				case (#History) {"history"};
            	case (#AudioGuide) {"audio_guide"};
            	case (#Audio) {"audio"};
            	case (#Video) {"video"};
            	case (#Gallery) {"gallery"};
            	case (#Article) {"article"};
            	case (#Document) {"doc"};
            	case (#AR) {"ar"};
            	case (#Sundry) {"sundry"};
        	};
    	}; 
	};


	public type RequestedObject = {
		id : Text;
		view_mode : ViewMode;
		route : Route;
		tag : ?Text;
	};	

	public type Route = {
		#Bundle;
		#Asset;     
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

	public type Metadata = {
		var name : Text;
		var description : Text;
		var logo : ?DataRawPayload;
	};

	// mode governs the behavior who can create new bundle
	public type Submission = {
		// only single owner can register a new bundle
		#Private; 
		// anyone
		#Public;
		// owner can apply list of users that can contribute with their bundles
		#Shared;
	};
	// mode governs the identifier style for new bundle
	public type Identifier = {
		#Ordinal;
		#Hash;
	};

	public type SearchCriteriaArgs = {
		// true -- AND for all filters; false --> OR for all filters
		intersect : Bool;
		country_code :?Text;
		creator : ?CommonTypes.Identity;
		tag : ?Text;
		classification : ?Text;
	};	

	public type PackageDetails = {
		submission : Submission;
		creator : CommonTypes.Identity;
		owner : CommonTypes.Identity;
		created : Int;
		total_bundles : Nat;
		max_supply : ?Nat;
		name : Text;
		description : Text;
		logo_url : ?Text;
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

	public let DEFAULT_MODE : Mode = {
		submission = #Public;
		identifier = #Hash;
		max_supply = null;
		max_creator_supply = null;
		max_tag_supply = null;
	};

	public type DataPackageAction = {
		#Upload;
		#UploadChunk;
		#Package;
	};

	public type DataRawPayload = {
		value : Blob;
		content_type : ?Text;
	};

	public type DataDomainPayload = {
		location : ?CommonTypes.Location;
		about : ?CommonTypes.AboutData;
		reference : ?CommonTypes.ReferenceData;
		history : ?CommonTypes.HistoryData;
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

	public type DataIndex = {
		var location : ?CommonTypes.Location;
	};	

	public type BundlePayload = {
		var poi_group : ?DataGroup;
		var additions_group : ?DataGroup;
	};

	public type BundleIndex = {
		// only from POI
		var location : ?CommonTypes.Location;
		// only from POI
		var about : List.List<CommonTypes.AboutData>;
		var tags : List.List<Text>;
		var classification : Text;
	};

	public type Bundle = {
		// path to the root data partition
		data_path : CommonTypes.ResourcePath;
		var name : Text;
		var description : Text;
		// simple light weigh logo
		var logo : ?CommonTypes.ResourcePath;
		// payload
		var payload : BundlePayload;
		var index : BundleIndex;
		creator : CommonTypes.Identity;
		var owner : CommonTypes.Identity;
		// modifications! query is available for all, forever
		var access_list : List.List<CommonTypes.Identity>;
		created : Time.Time;
	};

	public type BundleArgs = {
		name : Text;
		description : Text;
		classification : Text;
		logo : ?DataRawPayload;
		tags : [Text];
	};

	public type DataFreezeArgs = {
		group : CommonTypes.DataGroupId;
		period_sec : ?Nat
	};

	public type DataPathArgs = {
		group : CommonTypes.DataGroupId;
		category : ?CommonTypes.CategoryId;
		resource_id : ?Text;
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
		nested_path : ?Text;
		name : ?Text;
		locale : ?Text;
		// used for the replacement
		resource_id : ?Text;
		payload : T;
		action : DataPackageAction;
	};

	public type DataPackageRawArgs = DataRequest<DataRawPayload>;

	public type DataPackageArgs = DataRequest<DataDomainPayload>;

	public type BundleUpdateArgs = {
		name : ?Text;
		description : ?Text;
		logo : ?DataRawPayload;
		tags : ?[Text];
		classification : ?Text;
	};

	public type MetadataArgs = {
		name : Text;
		description : Text;
		logo : ?DataRawPayload;
	};
	
	public type MetadataUpdateArgs = {
		name : ?Text;
		description : ?Text;
		logo : ?DataRawPayload;
	};	

	// input arguments to install a new BundlePackage actor
	public type BundlePackageArgs = {
		network : CommonTypes.Network;
		// mode
		mode : ?Mode;
		// target owner. If not specified, then onwer = who installs the canister
		owner : ?CommonTypes.Identity;
		// request is rejected if mode if not Shared
		contributors : ?[CommonTypes.Identity];
		metadata : ?MetadataArgs;
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
			readonly : ?Nat;
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
			readonly_resource : shared (id : Text, readonly : ?Nat) -> async Result.Result<IdUrl, CommonTypes.Errors>;
			store_chunk : shared (content : Blob, binding_key : ?Text) -> async Result.Result<Text, CommonTypes.Errors>;
			commit_batch_by_key : shared (binding_key : Text, resource_args : ResourceArgs) -> async Result.Result<IdUrl, CommonTypes.Errors>;		
		};

	
	};
	///

};
