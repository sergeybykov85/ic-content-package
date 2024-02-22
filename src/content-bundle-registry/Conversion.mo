
import List "mo:base/List";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

import Types "./Types";
import CommonTypes "../shared/CommonTypes";


module {

	public type BundlePackageView = {
		// principal id
		id : Text;
		submission : Types.Submission;
		max_supply : ?Nat;
		name : Text;
		description : Text;
		logo_url : ?Text;
		created: Time.Time;
		submitted: Time.Time;
		// who created a package
		creator : CommonTypes.Identity;
		// who submitted a package
		submitter : CommonTypes.Identity;		
	};

	public type Package2BundlesView = {
		package : BundlePackageView;
		bundles : CommonTypes.DataSlice<Types.Actor.BundleRefView>;
	};

	public type SubmitterView = {
		identity : CommonTypes.Identity;
		name : Text;
		description : Text;
		// principal id
		packages : [Text];
		created: Time.Time;
	};

	public func convert_package_view (id: Text, info: Types.BundlePackage) : BundlePackageView {
        return {
			id = id;
			submission = info.submission;
			max_supply = info.max_supply;
			name = info.name;
			description = info.description;
			logo_url = info.logo_url;
			created = info.created;
			creator = info.creator;
			submitted = info.submitted;
			submitter = info.submitter;
        };
    };		

	public func convert_submitter_view (info: Types.Submitter) : SubmitterView {
        return {
			name = info.name;
			description = info.description;
			identity = info.identity;
			packages = List.toArray (info.packages);
			created = info.created;
        };
    };

	public func convert_package2bundles_view (id: Text, package: Types.BundlePackage, slice : CommonTypes.DataSlice<Types.Actor.BundleRefView>) : Package2BundlesView {
        return {
			package = {
				id = id;
				submission = package.submission;
				max_supply = package.max_supply;
				name = package.name;
				description = package.description;
				logo_url = package.logo_url;
				created = package.created;
				creator = package.creator;
				submitted = package.submitted;
				submitter = package.submitter;
        	};
			bundles = slice;
		}
    };	

  
};
