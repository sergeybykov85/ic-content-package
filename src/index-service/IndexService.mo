import Cycles "mo:base/ExperimentalCycles";
import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Timer "mo:base/Timer";
import Time "mo:base/Time";
import Text "mo:base/Text";
import List "mo:base/List";
import Buffer "mo:base/Buffer";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Result "mo:base/Result";

import Types "./Types";

import CommonUtils "../shared/CommonUtils";
import CommonTypes "../shared/CommonTypes";

shared  (installation) actor class IndexService(initArgs : Types.IndexServiceArgs) = this {

	// def scan period is 5 min = 300 sec
	let SYNC_DATA_SEC = 300;
	// expiration period for chunk = 60 sec (in nanosec)
	let MIN_RESCAN_PERIOD =  60 * 1_000_000_000;

    let CREATOR = installation.caller;

	// who can manage
 	stable var operators = initArgs.operators;

	// period to synch data
	stable var sync_data_sec = SYNC_DATA_SEC;

	// packages to scan
	stable var all_packages : List.List<Text> = List.nil();

    // all packages, key - principal id
    stable var packages : Trie.Trie<Text, Types.PackageRef> = Trie.empty();	

	private func package_get(id : Text) : ?Types.PackageRef = Trie.get(packages, CommonUtils.text_key(id), Text.equal);	

	// package --> country. Needed to track the update in case of country exclusion
    stable var package2country : Trie.Trie<Text, [Text]> = Trie.empty();
	// country --> package. Index to make the search
    stable var country2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();
	// package --> tag. Needed to track the update in case of tag exclusion
    stable var package2tag : Trie.Trie<Text, [Text]> = Trie.empty();
	// tag --> package. Index to make the search
    stable var tag2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();
	// classification --> package. Index to make the search
    stable var classification2package : Trie.Trie<Text, List.List<Text>> = Trie.empty();
	// package --> classifications. Needed to track the update in case of classifications exclusion
    stable var package2classification : Trie.Trie<Text, [Text]> = Trie.empty();	

	// it is ok to store tags without any processing because, the tags are already normalized and verified by package canister.
	// it is the reason why the usage of CommonUtils.text_key is OK
    private func tag2package_get(id : Text) : ?List.List<Text> = Trie.get(tag2package, CommonUtils.text_key(id), Text.equal);		

    private func country2package_get(id : Text) : ?List.List<Text> = Trie.get(country2package, CommonUtils.text_key(id), Text.equal);		

	private func classification2package_get(id : Text) : ?List.List<Text> = Trie.get(classification2package, CommonUtils.text_key(id), Text.equal);		

    private func package2tag_get(id : Text) : ?[Text] = Trie.get(package2tag, CommonUtils.text_key(id), Text.equal);

	private func package2classification_get(id : Text) : ?[Text] = Trie.get(package2classification, CommonUtils.text_key(id), Text.equal);	

    private func package2country_get(id : Text) : ?[Text] = Trie.get(package2country, CommonUtils.text_key(id), Text.equal);

	/**
	* Returns elements to exclude and include based on the current state and input values
	*/
	private func _excluded_includeed (get : (id : Text) -> ?[Text], package_id:Text, values:[Text]) : ([Text],[Text]) {
		switch (get(package_id)) {
			case (?current) {
				let exclude = Array.mapFilter<Text, Text>(current,
					func(b:Text) : ?Text {
						switch (Array.find<Text>(values, func x = x == b)) {
							case (null) {?b};
							case (?found) {null};
						};
					}
				);
				let include = Array.mapFilter<Text, Text>(values,
					func(b:Text) : ?Text {
						switch (Array.find<Text>(current, func x = x == b)) {
							case (null) {?b};
							case (?found) {null};
						};
					}
				);
				(exclude, include);
			};
			case (null) {([], values)};
		};
	};

    private func _index_include_package(get : (id : Text) -> ?List.List<Text>, index : Trie.Trie<Text, List.List<Text>>,  value:Text, package_id:Text) :  Trie.Trie<Text, List.List<Text>> {
		switch (get(value)) {
			case (?package_ids) {
				for (leaf in List.toIter(package_ids)){
					if (leaf == package_id) return index;
				};
				Trie.put(index, CommonUtils.text_key(value), Text.equal, List.push(package_id, package_ids)).0;       
			};
			case (null) { Trie.put(index, CommonUtils.text_key(value), Text.equal, List.push(package_id, List.nil())).0; };
		};
    };

    private func _index_exclude_package(get : (id : Text) -> ?List.List<Text>, index : Trie.Trie<Text, List.List<Text>>, value:Text, package_id:Text) : Trie.Trie<Text, List.List<Text>> {
		switch (get(value)) {
			case (?package_ids) {
				let fpack = List.mapFilter<Text, Text>(package_ids,
					func(b:Text) : ?Text {
						if (b == package_id) { return null; }
						else { return ?b; }
					}
				);
				Trie.put(index, CommonUtils.text_key(value), Text.equal, fpack).0;       
			};
			case (null) {index};
		};
    };			

	private func _process_package_tags (package_id:Text, tags:[Text]) : () {
		let ex_in:([Text],[Text]) = _excluded_includeed(package2tag_get, package_id, tags);
		for (t in ex_in.0.vals()) {
			tag2package := _index_exclude_package(tag2package_get, tag2package, t, package_id);
		};		
		for (t in ex_in.1.vals()) {
			tag2package := _index_include_package(tag2package_get, tag2package, t, package_id);
		};
		package2tag := Trie.put(package2tag, CommonUtils.text_key(package_id), Text.equal, tags).0;       
	};

	private func _process_package_classifications (package_id:Text, classifications:[Text]) : () {
		let ex_in:([Text],[Text]) = _excluded_includeed(package2classification_get, package_id, classifications);
		for (t in ex_in.0.vals()) {
			classification2package := _index_exclude_package(classification2package_get, classification2package, t, package_id);
		};		
		for (t in ex_in.1.vals()) {
			classification2package := _index_include_package(classification2package_get, classification2package, t, package_id);
		};
		package2classification := Trie.put(package2classification, CommonUtils.text_key(package_id), Text.equal, classifications).0;       
	};	

	private func _process_package_countries (package_id:Text, countries:[Text]) : () {
		let ex_in:([Text],[Text]) = _excluded_includeed(package2country_get, package_id, countries);
		for (t in ex_in.0.vals()) {
			country2package := _index_exclude_package(country2package_get, country2package, t, package_id);
		};		
		for (t in ex_in.1.vals()) {
			country2package := _index_include_package(country2package_get, country2package, t, package_id);
		};
		package2country := Trie.put(package2country, CommonUtils.text_key(package_id), Text.equal, countries).0;       
	};	


	private func _sync_package (package_id : Text, ref: Types.PackageRef) :  async Result.Result<(), CommonTypes.Errors> {
		try {
			let package_actor : Types.Actor.BundlePackageActor = actor (package_id);
			let segment = await package_actor.get_data_segmentation();

			ref.last_scan := Time.now();

			_process_package_tags(package_id, segment.tags);
			_process_package_classifications(package_id, segment.classifications);
			_process_package_countries(package_id, segment.countries);
			#ok();
		}catch (e) {
			// ignore for now
			return #err(#ActionFailed);
		};
	};

	private func _sync_data_job () : async () {
		for ((id, r) in Trie.iter(packages)) {
			let delta = (Time.now() - r.last_scan);
			// if package just added, then it was scanner recently. No need to synch tags again
			if (delta > MIN_RESCAN_PERIOD) ignore await _sync_package(id, r);
		};
	};
	
	stable var timer_data_sync = Timer.recurringTimer(#seconds(sync_data_sec), _sync_data_job);

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
		switch (package_get(package_id)) {
			case (?pack) {return #err(#DuplicateRecord)};
			case (null) {
				try {
					let package_actor : Types.Actor.BundlePackageActor = actor (package_id);
					let segment = await package_actor.get_data_segmentation();
					all_packages:= List.push(package_id, all_packages);
					packages := Trie.put(packages, CommonUtils.text_key(package_id), Text.equal, {
						submitted = Time.now();
						var last_scan = Time.now();
					}:Types.PackageRef).0;
					
					_process_package_tags(package_id, segment.tags);
					_process_package_classifications(package_id, segment.classifications);
					_process_package_countries(package_id, segment.countries);
					#ok(package_id);
				}catch (e) {
					// ignore for now
					return #err(#ActionFailed);
				};
			};
		};
	};

	public shared ({ caller }) func sync_package (package_id:Text) : async Result.Result<(), CommonTypes.Errors> {
		if (not (caller == CREATOR or _is_operator(caller))) return #err(#AccessDenied);
		switch (package_get(package_id)) {
			case (null) {return #err(#NotFound)};
			case (?ref) { return await _sync_package (package_id, ref)};
		};
	};	
	/**
	* This method might be useful due various reasons. Let's have it
	*/
	public shared ({ caller }) func reset_index () : async Result.Result<(), CommonTypes.Errors> {
		if (not (caller == CREATOR or _is_operator(caller))) return #err(#AccessDenied);
		package2country := Trie.empty();
    	country2package := Trie.empty();
    	package2tag := Trie.empty();
    	tag2package := Trie.empty();
    	classification2package := Trie.empty();
    	package2classification := Trie.empty();	
		#ok();
	};


	public shared ({ caller }) func apply_scan_period(seconds : Nat) : async Result.Result<(), CommonTypes.Errors> {
		if (not (caller == CREATOR or _is_operator(caller))) return #err(#AccessDenied);
		sync_data_sec:=seconds;
		Timer.cancelTimer (timer_data_sync);
		timer_data_sync:= Timer.recurringTimer(#seconds(sync_data_sec), _sync_data_job);
		return #ok();
	};	

	public query func get_packages_by_tag(tag:Text) : async [Text] {
		switch (tag2package_get(tag)) {
			case (?ids) { List.toArray(ids) };
			case (null) {[]};
		}
	};

	public query func get_packages_by_country(country_code:Text) : async [Text] {
		switch (country2package_get(country_code)) {
			case (?ids) { List.toArray(ids) };
			case (null) {[]};
		}
	};	

	public query func get_packages_by_classification(classification:Text) : async [Text] {
		switch (classification2package_get(classification)) {
			case (?ids) { List.toArray(ids) };
			case (null) {[]};
		}
	};	

	public query func get_tags_by_package(package_id:Text) : async [Text] {
		switch (package2tag_get(package_id)) {
			case (?ids) {ids };
			case (null) {[]};
		}
	};

	public query func get_countries_by_package(package_id:Text) : async [Text] {
		switch (package2country_get(package_id)) {
			case (?ids) {ids };
			case (null) {[]};
		}
	};	

	public query func get_classifications_by_package(package_id:Text) : async [Text] {
		switch (package2classification_get(package_id)) {
			case (?ids) {ids };
			case (null) {[]};
		}
	};	

	public query func get_package_ref(package_id:Text) : async  Result.Result<Types.PackageRefView, CommonTypes.Errors>{
		switch (package_get(package_id)) {
			case (?r) {
				return #ok({
					id = package_id;
					submitted = r.submitted;
					last_scan = r.last_scan;
					tags = switch (package2tag_get(package_id)) {
						case (?ids) {ids };
						case (null) {[]};
					};
					classifications = switch (package2classification_get(package_id)) {
						case (?ids) {ids };
						case (null) {[]};
					};
					countries = switch (package2country_get(package_id)) {
						case (?ids) {ids };
						case (null) {[]};
					};									
				}); 
			};
			case (null) { return #err(#NotRegistered)};
		}
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

	public query func get_sync_data_sec() : async Nat {
		return sync_data_sec;
	};

	/**
	* Returns data segmentation, aka classification over all packages
	*/
	public query func get_data_segmentation () : async CommonTypes.Segmentation {
		{
			total_supply = List.size(all_packages);
			classifications = _trie_keys(classification2package);
			countries = _trie_keys(country2package);
			tags = _trie_keys(tag2package);
		}
	};

	private func _is_operator(id: Principal) : Bool {
    	Option.isSome(Array.find(operators, func (x: Principal) : Bool { x == id }))
    };

	private func _trie_keys (t: Trie.Trie<Text, List.List<Text>> ) : [Text] {
		let _buff = Buffer.Buffer<Text>(Trie.size(t));
		for ((key, a) in Trie.iter(t)){
			_buff.add(key);
		};
		Buffer.toArray(_buff);
	};

	system func preupgrade() {
		Timer.cancelTimer(timer_data_sync);
	};

	system func postupgrade() {
		timer_data_sync:= Timer.recurringTimer(#seconds(sync_data_sec), _sync_data_job);
	};			
};
