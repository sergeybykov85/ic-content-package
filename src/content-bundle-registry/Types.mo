import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Time "mo:base/Time";
import List "mo:base/List";
import Blob "mo:base/Blob";

import CommonTypes "../shared/CommonTypes";
import BundlePackage "../content-bundle/BundlePackage";

module {

	public type RequestedObject = {
		id : Text;
		view_mode : ViewMode;
		submission_type : ?Text;
	};

	public type Submission = {
		#Private; 
		#Public;
		#Shared;
	};

	public type SearchCriteriaArgs = {
		// true -- AND for all filters; false --> OR for all filters
		intersect : Bool;
		kind : ?Submission;
		creator : ?CommonTypes.Identity;
		country_code :?Text;		
		tag : ?Text;
		classification : ?Text;
	};		


	public type ImageData = {
		value : Blob;
		content_type : ?Text;
	};

	public type ViewMode = {
		#Index;     // index, names could be used as a part of browser url
	};

	public type PackageRegistryArgs = {
		network : CommonTypes.Network;
		index_service : ?Text;
		// target owner. If not specified, then onwer = who installs the canister
		owner : ?CommonTypes.Identity;
	};

	public type CommonUpdateArgs = {
		identity : CommonTypes.Identity;
		name : ?Text;
		description : ?Text;
		urls : ?[CommonTypes.NameValue];
	};

	public type CommonArgs = {
		identity : CommonTypes.Identity;
		name : Text;
		description : Text;
		urls : [CommonTypes.NameValue];
	};	

	public type BundlePackage = {
		var name : Text;
		var description : Text;
		var logo_url : ?Text;
		// any urls related to the package
		var references : List.List<CommonTypes.NameValue>;
		submission : Submission;
		max_supply : ?Nat;
		// who created a package
		creator : CommonTypes.Identity;
		// who registered a package
		submitter : CommonTypes.Identity;
		created: Time.Time;
		registered: Time.Time;
	};

	public type Submitter = {
		var name : Text;
		var description : Text;
		identity : CommonTypes.Identity;
		// principal id
		var packages : List.List<Text>;
		created: Time.Time;
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
			max_supply : ?Nat;
			name : Text;
			description : Text;
			logo_url : ?Text;
		};

		public type IndexServiceActor = actor {
			register_package : shared (package : Principal)  -> async Result.Result<(Text), CommonTypes.Errors>;
			get_packages_by_tag : shared query (tag : Text) -> async [Text];
			get_packages_by_classification : shared query (classification : Text) -> async [Text];
			get_packages_by_country : shared query (country_code : Text) -> async [Text];
			get_data_segmentation : shared query () -> async CommonTypes.Segmentation;
		};

		public type BundlePackageActor = actor {
			get_creator : shared query() -> async CommonTypes.Identity;
			get_details : shared query() -> async PackageDetails;
		};

	};
};
