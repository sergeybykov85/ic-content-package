import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";
import Trie "mo:base/Trie";
import Nat8 "mo:base/Nat8";

import CommonTypes "../shared/CommonTypes";

module {

	public type TypeId = {
		// Just information, or information of several bundles
		#Bundle;
		// more complex object : list of summary details with expand mode etc
		#Feed;
		// more types possible laterrr
	};

	public type Status = {
		// only owner can see the items, widget criteria etc
		#Draft;
		// published widget, items visible for anyone
		#Active;
	};
	

	public type CriteriaArgs = {
		entity : ?IdsRef;
		by_tag : ?Text;
		by_country_code : ?Text;
		by_classification : ?Text;
	};

	public type WidgetCreationRequest = {
		name : Text;
		description : Text;
		type_id : TypeId;
		criteria : ?CriteriaArgs;
	};

	public type WidgetUpdateArgs = {
		name : ?Text;
		description : ?Text;
		status : ?Status;
	};		

	public type WidgetServiceArgs = {
		network : CommonTypes.Network;
		package_registry : ?Text;		
		owner : ?CommonTypes.Identity;
	};

	public type AllowanceArgs = {
		identity : CommonTypes.Identity;
		allowed_widgets : Nat;
	};

	public type Allowance = {
		allowed_widgets : Nat;
	};	

	public type Activity = {
		// deployed widgets
		registered_widgets : [Text];
		allowance : Nat;
	};

	public type IdsRef = {
		package_id : Text;
		ids : ?[Text];
	};

	public type Criteria = {
		// if entity, then other parametrs are ignored
		// principle is simple : either BY ids or by other criteria
		// priority : entity, package, tags, classifications
		var entity : ?IdsRef;
		var by_country_code : ?Text;
		var by_tag : ?Text;
		var by_classification : ?Text;
	};

	public type Options = {
		var width : ?Nat8;
		var height : ?Nat8;
		// other fields that impact to UI style could be placed here
	};

	public type Widget = {
		var name : Text;
		var description : Text;
		type_id : TypeId;
		var status : Status;
		var criteria : ?Criteria;
		var options : ?Options;
		creator : CommonTypes.Identity;
		created : Time.Time;
	};

	public type BundleSearchCriteria = {
		// true -- AND for all filters; false --> OR for all filters
		intersect : Bool;
		country_code :?Text;
		creator : ?CommonTypes.Identity;
		tag : ?Text;
		classification : ?Text;
	};

	public type SearchCriteriaArgs = {
		// true -- AND for all filters; false --> OR for all filters
		intersect : Bool;
		kind : ?TypeId;
		creator : ?CommonTypes.Identity;
	};	

	/**
		Module to inter-canister calls
	*/
	public module Actor {

		public type BundlePackageView = {
			// principal id
			id : Text;
			submission : {#Private; #Public; #Shared;};
			max_supply : ?Nat;
			name : Text;
			description : Text;
			created: Time.Time;
			submitted: Time.Time;
		};		

		public type DataIndexView = {
			// only from POI
			location : ?CommonTypes.Location;
			// only from POI
			about : [CommonTypes.AboutData];
			tags : [Text];
			classification : Text;
		};

		public type BundleDetailsView = {
			data_path : CommonTypes.ResourcePath;
			name : Text;
			description : Text;
			logo : ?CommonTypes.ResourcePath;
			index : DataIndexView;
			creator : CommonTypes.Identity;
			owner : CommonTypes.Identity;
			created : Time.Time;
		};			

		public type PackageView = {
			// principal id
			id : Text;
			submission : {
				#Private; 
				#Public;
				#Shared;
			};
			max_supply : ?Nat;
			name : Text;
			description : Text;
			created: Time.Time;
			submitted: Time.Time;
		};

		public type PackageRegistryActor = actor {
			get_packages: shared query (ids:[Text]) -> async [PackageView];
			get_packages_by_criteria: shared query (criteria: {
				intersect : Bool;
				kind : ?{
					#Private; 
					#Public;
					#Shared;
				};
				creator : ?CommonTypes.Identity;
				country_code : ?Text;
				tag : ?Text;
				classification : ?Text;
			}) -> async [BundlePackageView];

		};

		public type BundlePackageActor = actor {
			get_bundles_page : shared query (start: Nat, limit: Nat, criteria: ?BundleSearchCriteria) -> async CommonTypes.DataSlice<BundleDetailsView>;
			get_refs_by_ids : shared query (ids:[Text]) -> async [Text];
			get_bundles_by_ids : shared query (ids:[Text]) -> async [BundleDetailsView];
		};				

	};
};
