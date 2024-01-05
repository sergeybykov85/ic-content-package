import Text "mo:base/Text";
import Time "mo:base/Time";
import CommonTypes "../shared/CommonTypes";

module {

	public type TagServiceArgs = {
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
	};	

	/**
		Module to inter-canister calls
	*/
	public module Actor {

		public type BundlePackageActor = actor {
			get_tags : shared ()  -> async [Text];
		};

	};
};
