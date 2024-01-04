import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Timer "mo:base/Timer";
import Text "mo:base/Text";
import List "mo:base/List";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Result "mo:base/Result";

import Types "./Types";

import CommonUtils "../shared/CommonUtils";
import CommonTypes "../shared/CommonTypes";

shared  (installation) actor class TagService(initArgs : Types.TagServiceArgs) = this {

	// def scan period is 60 min = 3600 sec
	let SYNC_TAG_SEC = 3600;

    let CREATOR = installation.caller;

	// who can manage
 	stable var operators = initArgs.operators;

	// period to synch data
	stable var sync_tags_sec = SYNC_TAG_SEC;

	// packages to scan
	stable var packages : List.List<Text> = List.nil();

	// tag to package
    stable var tags2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();

    private func tags2package_get(id : Text) : ?List.List<Text> = Trie.get(tags2package, CommonUtils.text_key(id), Text.equal);		
	/**
	* Applies list of operators for the tag service
	*/
    public shared ({ caller }) func apply_operators(ids: [Principal]) {
    	assert(caller == CREATOR);
    	operators := ids;
    };

	public shared ({ caller }) func register_package (package : Principal) : async Result.Result<Text, CommonTypes.Errors> {
		if (not (caller == CREATOR or _is_operator(caller))) return #err(#AccessDenied);
		let package_id = Principal.toText(package);
		#ok(package_id);
	};

  	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept(amount);
  	};
	
	public query func available_cycles() : async Nat {
		return Cycles.balance();
  	};

	public query func get_creator() : async Principal {
		CREATOR;
	};

	public query func get_operators() : async [Principal] {
		operators;
	};

	private func _is_operator(id: Principal) : Bool {
    	Option.isSome(Array.find(operators, func (x: Principal) : Bool { x == id }))
    };			
};
