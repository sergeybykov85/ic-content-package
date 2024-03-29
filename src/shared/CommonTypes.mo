import Principal "mo:base/Principal";
import Time "mo:base/Text";
import List "mo:base/List";
import Blob "mo:base/Blob";

module {

	public type NameValue = {name : Text; value : Text; };

	public type Location = {country_code2:Text; region:?Text; city:?Text; coordinates:Coordinates};

	public type AboutData = { name : Text; description : Text; locale : Text; attributes : [NameValue];};

	public type HistoryData = {date_from:?Nat; date_to:?Nat; period:?Text; title : Text; body : Text; locale : Text;};

	public type ReferenceData = { title : Text; url : Text};

	public type Coordinates = {latitude : Float; longitude : Float};

	public type ResourcePath = {url : Text; bucket_id:Text; resource_id: Text; locale:?Text;  name:?Text};

	public type Segmentation = {
		total_supply : Nat;
		classifications : [Text];
		countries : [Text];
		tags : [Text];
	};

	public type DataSlice <T> = {
		// global supply irrespective of the response
		total_supply : Nat;
		// items based on the criterria
		items : [T];
	};

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

	public type DataPayloadStructure = {
		group_id : DataGroupId;
		categories : [CategoryId];
	};

	public type Errors = {
		// not enough cycles
		#FuelNotEnough;
		// data store is not ready for the package
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
		// not authorized
		#UnAuthorized;		
		// not authorized to manage certain object
		#AccessDenied;
		// no resource or no chunk
		#ActionFailed;	
    };

	public module Actor = {
		public type ICActor = actor {
        	stop_canister : shared { canister_id : Principal } -> async ();
			delete_canister : shared { canister_id : Principal } -> async ();
        	update_settings : shared {
            	canister_id : Principal;
            	settings : {controllers : ?[Principal]; };
        	} -> async ();
    	};

		public type Wallet = actor {
    		wallet_receive : () -> async ();
			withdraw_cycles : shared {to : Principal; remainder_cycles : ?Nat} -> async ();
    	};	
	}	
	
};
