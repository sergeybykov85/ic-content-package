import Text "mo:base/Text";
import CommonTypes "../shared/CommonTypes";

module {

	public type TagServiceArgs = {
		network : CommonTypes.Network;
		// operators to work with a repo
		operators : [Principal];		
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
