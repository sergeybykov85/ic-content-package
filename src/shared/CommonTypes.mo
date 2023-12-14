import Principal "mo:base/Principal";
import Time "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";

module {
	public type Location = {country_code2:Text; region:?Text; city:?Text; coordinates:?Coordinates};

	public type Coordinates = {latitude : Float; longitude : Float};

	public type AccessList = {owner : Principal; operators : [Principal]};

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

	public type DataGroupId = {
		#POI;
		#Additions;
	};	

	public type ItemCategory = {
		#General;
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

	public type Errors = {
		// data store is not initialized
		#DataStoreNotInitialized;
		// no resource or no chunk
		#NotFound;
		// data is not supported now
		#NotSupported;
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

	public module Serialization {
		public let POI_GENERAL_FIELDS = ["name", "value", "category", "location", "latitude", "longitude", "attributes", "owner", "country_code2", "region", "city", "coordinates"];
		public let POI_ABOUT_FIELDS = ["name", "value", "attributes", "locale", "short_description", "description"];
		
		public type StructureArgs = {
			general : ?GeneralJson;
			about : ?AboutDataJson;
		};	
		public type GeneralJson = {
			name : Text;
			location: Location;
			attributes : [NameValue];
		};

		public type AboutDataJson = {
			name : Text;
			short_description : ?Text;
			description : Text;
			locale : Text;
			attributes : [NameValue];
		};	
	};	

	
};
