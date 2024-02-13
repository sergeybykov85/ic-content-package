
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

  
};
