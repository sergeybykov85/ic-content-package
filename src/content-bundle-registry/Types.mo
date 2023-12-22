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

	public type ImageData = {
		value : Blob;
		content_type : ?Text;
	};

	public type PackageRegistryArgs = {
		network : CommonTypes.Network;
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

	public type PackageRequestArgs = {
		package : Principal;
		name : Text;
		description : Text;
		urls : [CommonTypes.NameValue];
	};

	public type BundlePackage = {
		var name : Text;
		var description : Text;
		// any urls related to the package
		var urls : List.List<CommonTypes.NameValue>;
		created: Time.Time;	
	};

	public type Provider = {
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

		public type BundlePackageActor = actor {
			get_creator : shared () -> async CommonTypes.Identity;
		};
	};
};
