import Principal "mo:base/Principal";
import Time "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";

module {

	public type NameValue = {name : Text; value : Text; };

	public type Location = {country_code2:Text; country:?Text; region:?Text; city:?Text; coordinates:Coordinates};

	public type AboutData = { name : Text; description : Text; locale : Text; attributes : [NameValue];};

	public type HistoryData = {date_from:?Nat; date_to:?Nat; period:?Text; title : Text; body : Text; locale : Text;};

	public type ReferenceData = { title : Text; url : Text};

	public type Coordinates = {latitude : Float; longitude : Float};

	public type ResourcePath = {url : Text; bucket_id:Text; resource_id: Text; locale:?Text;  name:?Text};

	public type IdentityType = {
		#ICP;
		#EvmChain; 
	};

	
	public type Network = {
        #IC;
        #Local: Text; // host details like localhost:4943
    };

	public type Identity = {
		identity_type : IdentityType;
		identity_id : Text;
	};

	public type DataGroupId = {
		#POI;
		#Additions;
	};	

	public type CategoryId = {
		#Location;
		#About;
		#History;
		#AudioGuide;
		#Audio;
		#Video;
		#Gallery;
		#Article;
		#Document;
		#AR;
		#Sundry;
	};

	public type Errors = {
		#DataStoreNotInitialized;
		// no resource or no chunk
		#NotFound;
		// data is not supported now
		#NotSupported;
		// record already registered
		#DuplicateRecord;
		// action not allowed by the logic or constraints
        #OperationNotAllowed;
		// exceed the restriction
		#LimitExceeded;
        // not registered
        #NotRegistered;
		// when input argument contains wrong value
		#InvalidRequest;
		// not authorized to manage certain object
		#AccessDenied;
		// no resource or no chunk
		#ActionFailed;	
    };
	
};
