import Text "mo:base/Text";
import Time "mo:base/Time";
import CommonTypes "../shared/CommonTypes";

module {

	public type IndexServiceArgs = {
		network : CommonTypes.Network;
		// operators to work with a repo
		operators : [Principal];		
	};

	public type PackageRef = {
		registered: Time.Time;
		var last_scan : Time.Time;
	};	

	public type PackageRefView = {
		id : Text;
		registered: Time.Time;
		last_scan : Time.Time;
		tags : [Text];
		classifications : [Text];
		countries : [Text];
	};	

	/**
		Module to inter-canister calls
	*/
	public module Actor {

		public type BundlePackageActor = actor {
			get_tags : shared query()  -> async [Text];
			get_classifications : shared query()  -> async [Text];
			get_country_codes : shared query()  -> async [Text];
		};

	};
};
