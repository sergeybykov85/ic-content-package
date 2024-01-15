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
import BundlePackage "../content-bundle/BundlePackage";

module {

	public type WidgetType = {
		// Just information, or information of several bundles
		#Bundle;
		// more complex object : list of summary details with expand mode etc
		#Feed;
		// more types possible laterrr
	};

	public type CriteriaArgs = {
		ids : [EntityRef];
		tags : [Text];
		classifications : [Text];
		packages : [Text];
	};

	public type WidgetCreationRequest = {
		name : Text;
		description : Text;
		type_id : WidgetType;
		criteria : ?CriteriaArgs;
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

	public type EntityRef = {
		package_id : Text;
		id : Text;
	};

	public type Criteria = {
		// if ids, then other parametrs are ignored
		// principle is simple : either BY ids or by other criteria
		// priority : ids, packages, tags, classifications
		var ids : [EntityRef];
		var packages : [Text];
		var tags : [Text];
		var classifications : [Text];
	};

	public type Options = {
		var width : ?Nat8;
		var height : ?Nat8;
		// other fields that impact to UI style could be placed here
	};

	public type Widget = {
		var name : Text;
		var description : Text;
		type_id : WidgetType;
		var criteria : ?Criteria;
		var options : ?Options;
		creator : CommonTypes.Identity;
		created : Time.Time;
	};

	/**
		Module to inter-canister calls
	*/
	public module Actor {

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
			registered: Time.Time;
		};
	
		public type PackageRegistryActor = actor {
			get_packages: shared query (ids:[Text]) -> async [PackageView];
		};		

	};
};
