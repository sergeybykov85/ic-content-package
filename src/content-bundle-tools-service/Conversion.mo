
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
		name : Text;
		description : Text;
		created: Time.Time;
		submitted: Time.Time;
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
			name = info.name;
			description = info.description;
			created = info.created;
			submitted = info.submitted;
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
