import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Cycles "mo:base/ExperimentalCycles";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Float "mo:base/Float";
import Principal "mo:base/Principal";
import Option "mo:base/Option";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Nat64 "mo:base/Nat64";

import DataBucket "mo:ics2/DataBucket";
import Debug "mo:base/Debug";
import { JSON; Candid } "mo:serde";
import Json "mo:json/JSON";

import Http "../shared/Http";
import CommonTypes "../shared/CommonTypes";

import Conversion "./Conversion";
import Types "./Types";
import Utils "./Utils";

shared (installation) actor class BundlePackage(initArgs : Types.BundlePackageArgs) = this {

	let MAX_TAGS = 5;
	let DEF_CSS =  "<style>" # Utils.DEF_BODY_STYLE #
	".grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } "#
	".grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; } "#
	".grid_details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; } "#
	".logo { max-height:200px; margin: 1em auto; display:block; } .logo_details { max-height:300px; margin: 1em auto; display:block; } "#
	".cell { min-height: 100px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } "#
	".cell_details { min-height: 250px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } "#
	".tag { color:#0969DA; margin: 0 4px; border: 1px solid #0969DA; border-radius: 8px; padding: 4px 10px; background-color:#B6E3FF;} "#
	".access_tag { color:white; font-size:large; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: absolute; right: 20px; top: 1px; background-color:#636466;} </style>";

    // 30 days
    let DEF_READONLY_SEC:Nat = 30 * 24 * 60 * 60;
	let NANOSEC:Nat = 1_000_000_000;

    let OWNER = installation.caller;
	stable let NETWORK = initArgs.network;
	stable var operators = initArgs.operators;
    stable let MODES = Option.get(initArgs.modes, Types.DEFAULT_MODE);

    // data store  model. More attributes could be placed here
    stable var data_store : Types.DataStore = {
		var active_bucket = null;
		var buckets = List.nil();
        var bucket_counter = 0;
		created = Time.now();
        var last_update = null
    };
    
    // increment counter, internal needs
	stable var _bundle_counter : Nat = 0;
	// tag to bundle
    stable var tags2bundle : Trie.Trie<Text, List.List<Text>> = Trie.empty();

    // all bunles inside this package
    stable var bundles : Trie.Trie<Text, Types.Bundle> = Trie.empty();

    private func tags2bundle_get(id : Text) : ?List.List<Text> = Trie.get(tags2bundle, Utils.tag_key(id), Text.equal);

    private func bundle_get(id : Text) : ?Types.Bundle = Trie.get(bundles, {key = id; hash = Text.hash id }, Text.equal);

	/**
	* Applies list of operators for the bundle package
	*/
    public shared ({ caller }) func apply_operators(ids: [Principal]) {
    	assert(caller == OWNER);
    	operators := ids;
    }; 
     
	/**
	* Register a new bunle
	* Allowed only to the owner or operator of the bucket.
	*/
	public shared ({ caller }) func register_bundle (args : Types.BundleArgs) : async Result.Result<Text, CommonTypes.Errors> {
		// different restrictions based on the mode
        switch (MODES.submission) {
            case (#Installer) {
                if (not (caller == OWNER or _is_operator(caller))) return #err(#AccessDenied);
                await _register_bundle(args, _build_identity(caller));
            };
            case (#Public) {
                await _register_bundle(args, _build_identity(caller));
            };
            case (#ACL) {
                if (not (caller == OWNER or _is_operator(caller))) return #err(#AccessDenied);
                await _register_bundle(args, _build_identity(caller));
            };
        };
    };

	/**
	* Updates an existing bundle, just override  description, tags, logo and if they specified
	* Allowed only to the owner of the bundle.
	*/
	public shared ({ caller }) func update_bundle (id: Text, args : Types.BundleUpdateArgs) : async Result.Result<Text, CommonTypes.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
            	// account should be controlled by owner,
				let identity = _build_identity(caller); 
				//if (not _access_allowed (bundle, identity, null)) return #err(#AccessDenied);
				if (Option.isSome(args.name)) {
					bundle.name:= Utils.unwrap(args.name);
				};                
				if (Option.isSome(args.description)) {
					bundle.description:= Utils.unwrap(args.description);
				};
				if (Option.isSome(args.tags)) {
					let tags = Utils.unwrap(args.tags);
					if (Array.size(tags) > MAX_TAGS) return #err(#InvalidRequest);
					for (tag in tags.vals()) {
  						if (Utils.invalid_tag_name(tag)) return #err(#InvalidRequest);
					};
					if (List.size(bundle.tags) > 0) {
						// exclude and include
						_exclude_tags (id, bundle.tags);
						bundle.tags:= List.fromArray(tags);
						_include_tags (id, bundle.tags);
					} else {
						// only save
						bundle.tags:= List.fromArray(tags);
						// apply tags for bundle
						_include_tags (id, bundle.tags);
					};
				};
				// replace logo
				if (Option.isSome(args.logo)) {
					ignore await _apply_bundle_logo(bundle, args.logo);
				}; 				
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
		
	};

	/**
	* Apply logo for the bundle item. If not specified, then the existing logo is removed
	* Allowed only to the owner of the bundle.
	*/
	public shared ({ caller }) func apply_bundle_logo (id: Text, logo : ?Types.DataPayload) : async Result.Result<Text, CommonTypes.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), null)) return #err(#AccessDenied);
				ignore await _apply_bundle_logo(bundle, logo);
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
	};

	/**
	* Apply logo for the bundle item. If not specified, then the existing logo is removed
	* Allowed only to the owner of the bundle.
	*/
	public shared ({ caller }) func apply_access_list (id: Text, args : Types.DataAccessListArgs) : async Result.Result<Text, CommonTypes.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), null)) return #err(#AccessDenied);

				switch (args.group) {
					// apply on the group level
					case (?group_val) {
					// init group if not initialized yet
						let data_group:Types.DataGroup = switch (await _assert_data_group(bundle, group_val)) {
						case (#ok(g)){
							switch (g) {
								case (#POI) {Utils.unwrap(bundle.payload.poi_group)};
								case (#Additions) {Utils.unwrap(bundle.payload.additions_group)};
							}
						};
						case (#err(_)) { return #err(#ActionFailed); };
						};
						data_group.access_list:= List.fromArray(args.access_list);	
					};
					// apply on the bundle level
					case (null) { bundle.access_list:= List.fromArray(args.access_list) };
				};
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
	};

	public shared ({ caller }) func transfer_ownership (id: Text, to : CommonTypes.Identity) : async Result.Result<Text, CommonTypes.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), null)) return #err(#AccessDenied);
				bundle.owner :=to;
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
	};	


	public shared ({ caller }) func freeze_bundle (id: Text, args: Types.DataFreezeArgs) : async Result.Result<Text, CommonTypes.Errors> {
		Debug.print("freeze_bundle "#debug_show(id)#" readonly "#debug_show(args.period_sec) # " for groups "#debug_show(args.groups));
		switch (bundle_get(id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), null)) return #err(#AccessDenied);

				for (group in args.groups.vals()) {
					// if group is not initialized --> no errors
					let data_group_opt = switch (group) {
						case (#POI) {bundle.payload.poi_group;};
						case (#Additions) {bundle.payload.additions_group;};
					};
					switch (data_group_opt) {
						case (?data_group) {
							let bucket_actor : Types.Actor.DataBucketActor = actor (data_group.data_path.bucket_id);
							// readoly paramter is nanosec
							let readonly : Nat = Int.abs(Time.now ()) + Option.get(args.period_sec, DEF_READONLY_SEC) * NANOSEC;
							switch (await bucket_actor.readonly_resource(data_group.data_path.resource_id, ?readonly)) {
								case (#ok(_)) {
									// update model
									data_group.readonly := ?readonly;
								};
								case (#err(e)){
								}
							};
						};
						case (null) {
						};
					}
				};
				return #ok(id);
			};
			case (null) { 
				Debug.print("Budnle not found. "#debug_show(id)#". FAILED to Apply readonly"); 
				return #err(#NotFound); };
		};
	};

	public shared ({ caller }) func remove_bundle_data (bundle_id: Text, args : Types.DataPathArgs) : async Result.Result<Text, CommonTypes.Errors> {
		if (Option.isNull(data_store.active_bucket)) return #err(#DataStoreNotInitialized);
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				//if (not _access_allowed (bundle, _build_identity(caller), ?args.group)) return #err(#AccessDenied);				
				let group_opt = switch (args.group) {
					case (#POI) {bundle.payload.poi_group};
					case (#Additions) {bundle.payload.additions_group}
				};
				switch (group_opt) {
					case (?group) {
						switch (args.category) {
							case (?category) {
								switch (_find_section(group,  category)) {
									case (?section) {
										// remove sections
										let bucket_actor : Types.Actor.DataBucketActor = actor (section.data_path.bucket_id);
										switch (await bucket_actor.delete_resource(section.data_path.resource_id)){
											// update model
											case (#ok(_)) {	_exclude_section(group, category);};
											case (#err(e)) {return #err(e)};
										};

									};
									case (null)  {return #err(#NotRegistered)};
								}
							};
							
							case (null) {
								let bucket_actor : Types.Actor.DataBucketActor = actor (group.data_path.bucket_id);
								// remove group
								switch (await bucket_actor.delete_resource(group.data_path.resource_id)){
									// update model
									case (#ok(_)) {
										switch (args.group) {
											case (#POI) {bundle.payload.poi_group:=null};
											case (#Additions) {bundle.payload.poi_group:=null};
										};
									};
									case (#err(e)) {return #err(e)};
								};
							}
						}
					};
					case (null) {return #err(#NotRegistered)}
				};
				return #ok(bundle_id);
			};
			case (null) { return #err(#NotFound); };
		};
	};		

	public shared ({ caller }) func apply_bundle_section_raw (bundle_id: Text, args : Types.DataPackageRawArgs) : async Result.Result<Text, CommonTypes.Errors> {
		if (Option.isNull(data_store.active_bucket)) return #err(#DataStoreNotInitialized);
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), ?args.group)) return #err(#AccessDenied);				

				// transformation is not needed
				switch (await _apply_bundle_section(bundle, args)) {
					// any post processing could be added here
					case (#ok()) { return #ok(bundle_id); };
					case (#err(e)) {return #err(e);};
				};
			};
			case (null) { return #err(#NotFound); };
		};
	};

	public shared ({ caller }) func apply_bundle_section (bundle_id: Text, args : Types.DataPackageArgs) : async Result.Result<Text, CommonTypes.Errors> {
		if (Option.isNull(data_store.active_bucket)) return #err(#DataStoreNotInitialized);
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				if (not _access_allowed (bundle, _build_identity(caller), ?args.group)) return #err(#AccessDenied); 

				// transform into raw format
				let blob_to_save = switch (Conversion.convert_to_blob(args.category, args.payload)) {
					case (#ok(b)) {b;};
					case (#err(e)) {return #err(e);};
				};
				// save into databucket
				switch (await _apply_bundle_section(bundle, {
					name = args.name;
					group = args.group;
					category = args.category;
					locale = args.locale;
					payload = { value = blob_to_save; content_type = ?"application/json"; };
					action = args.action;
				})) {
					// any post processing could be added here
					case (#ok()) { return #ok(bundle_id); };
					case (#err(e)) {return #err(e);};
				};
			};
			case (null) { return #err(#NotFound); };
		};
	};	

	/**
	* Init a store, creating a 1st data bucket
	* Allowed only to the owner 
	*/
	public shared ({ caller }) func init_data_store (cycles : ?Nat) : async Result.Result<Text, CommonTypes.Errors> {
		if (not (caller == OWNER)) return #err(#AccessDenied);
        // reeturn active bucket in case data store already initialized
        if (Option.isSome(data_store.active_bucket)) return #ok(Utils.unwrap(data_store.active_bucket));

		let canister_id = Principal.toText(Principal.fromActor(this));	

        let cycles_assign:Nat = Option.get(cycles, Option.get(initArgs.bucket_cycles, Utils.DEF_BUCKET_CYCLES));
	
		let bucket_counter = data_store.bucket_counter + 1;
		// first vision how to create "advanced bucket name" to have some extra information
		let bucket_name = debug_show({
			package = Principal.fromActor(this);
			bucket = "bucket_"#Nat.toText(bucket_counter);
		});
		// create a new bucket
		let bucket = await _register_bucket(bucket_name, [Principal.fromActor(this)], cycles_assign);
        
		data_store.active_bucket:=?bucket;
		data_store.buckets:=List.push(bucket, data_store.buckets);
        data_store.bucket_counter := bucket_counter;
        data_store.last_update := ?Time.now();

		// create root dir
		/*let bucket_actor : Types.Actor.DataBucketActor = actor (bucket);
		ignore await bucket_actor.new_directory(false, {
			content_type = null;
			name =  Principal.toText(Principal.fromActor(this));
			parent_path = null;
			parent_id = null;
			ttl = null;
			read_only = null;
		});*/
	
		return #ok(bucket);
	};

	/**
	* Init a store, creating a 1st data bucket
	* Allowed only to the owner 
	*/
	public shared ({ caller }) func new_data_bucket (cycles : ?Nat) : async Result.Result<Text, CommonTypes.Errors> {
		if (not (caller == OWNER)) return #err(#AccessDenied);
        if (Option.isNull(data_store.active_bucket)) return #err(#DataStoreNotInitialized);

		let canister_id = Principal.toText(Principal.fromActor(this));	

        let cycles_assign:Nat = Option.get(cycles, Option.get(initArgs.bucket_cycles, Utils.DEF_BUCKET_CYCLES));
	
		let bucket_counter = data_store.bucket_counter + 1;
		// first vision how to create "advanced bucket name" to have some extra information
		let bucket_name = debug_show({
			package = Principal.fromActor(this);
			bucket = "bucket_"#Nat.toText(bucket_counter);
		});
		// create a new bucket
		let bucket = await _register_bucket(bucket_name, [Principal.fromActor(this)], cycles_assign);
        
		data_store.active_bucket:=?bucket;
		data_store.buckets:=List.push(bucket, data_store.buckets);
        data_store.bucket_counter := bucket_counter;
        data_store.last_update := ?Time.now();

		// create root dir
		/*let bucket_actor : Types.Actor.DataBucketActor = actor (bucket);
		ignore await bucket_actor.new_directory(false, {
			content_type = null;
			name =  Principal.toText(Principal.fromActor(this));
			parent_path = null;
			parent_id = null;
			ttl = null;
			read_only = null;
		});*/
	
		return #ok(bucket);
	}; 	

	public shared query ({ caller }) func http_request(request : Http.Request) : async Http.Response {
		switch (Utils.get_resource_id(request.url)) {
			case (?r) {
				switch (r.view_mode) {
					case (#Index) {
						return bundle_http_handler(r.id, r.view_mode, r.tag);
					};
					case (#Open) {
						return bundle_data_handler(r.id, r.route);
					};
				};
			};
			case null { return Http.not_found();};
		};
	};

	private func _submit_data (root_path:CommonTypes.ResourcePath, replace_path:?CommonTypes.ResourcePath, name:Text, locale:?Text, payload : Types.DataPayload) : async Result.Result<CommonTypes.ResourcePath, CommonTypes.Errors> {
		let bucket_actor : Types.Actor.DataBucketActor = actor (root_path.bucket_id);
		let res = switch (replace_path) {
			case (?replace) {
				await bucket_actor.replace_resource(replace.resource_id, payload.value);						
			};
			case (null) {
				await bucket_actor.store_resource(payload.value, {
					content_type = payload.content_type;
					name = name;
					parent_id = ?root_path.resource_id;
					parent_path = null; ttl = null; read_only = null;
				});
			};
		};
		switch (res) {
			case (#ok(r)) {	#ok({locale=locale; url = r.url; bucket_id = r.partition; resource_id = r.id});	};
			case (#err (e)) { return #err(e)};
		};
	};	

    private func bundle_data_handler(key : Text, route : Types.Route) : Http.Response {
		// TODO : not implemented yet
		switch (bundle_get(key)) {
            case (null) { Http.not_found() };
            case (? v)  {Http.not_found();}
        };
    };	

    private func bundle_http_handler(key : Text, view_mode : Types.ViewMode, tag: ?Text) : Http.Response {
		if (key == Utils.ROOT) {
				let canister_id = Principal.toText(Principal.fromActor(this));
				var out_html = "<html><head>"#DEF_CSS#"</head><body>" # "<h2>&#128464; Overview &#9757; </h2><hr/>";
				switch (tag) {
					case (?t) {
						out_html:=out_html # "<h3>Bundles <span class=\"tag\">" # t # "</span></h3><div class=\"grid\">";
						let n_tag = Utils.normalize_tag(t);
						switch (tags2bundle_get(n_tag)) {
							case (?bundle_ids) {
								for (id in List.toIter(bundle_ids)) {
									switch (bundle_get(id)) {
            						case (null) { };
            						case (? r)  { out_html:=out_html # render_bundle_overview(canister_id, id, r);};
									};
								};
							};
							case (null) {};
						};
					};						
					case (null) {
						out_html := out_html # "<h3>Bundles</h3><div class=\"grid\">";
						for ((id, r) in Trie.iter(bundles)) {
							out_html:=out_html # render_bundle_overview(canister_id, id, r);
						};						
					};
				};
				return Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(out_html # "</div>"#Utils.FORMAT_DATES_SCRIPT#"</body></html>"));
		};

		switch (bundle_get(key)) {
            case (null) { Http.not_found() };
            case (? v)  {
				///
				let canister_id = Principal.toText(Principal.fromActor(this));
				let root_url = Utils.build_resource_url({resource_id = ""; canister_id = canister_id; network = initArgs.network; view_mode = #Index; route = null;});
				var directory_html = "<html><head>"#DEF_CSS#"</head><body>" # "<h2><span><a style=\"margin: 0 5px;\" href=\"" # root_url # "\" >"#Utils.ROOT#"</a></span>  &#128464; "#v.name#" </h2><hr/><h3>Bundle</h3><div class=\"grid_details\">";
				
				directory_html:=directory_html # render_bundle_details(canister_id, key, v);
				// extra details possible here
				return Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(directory_html # "</div>"#Utils.FORMAT_DATES_SCRIPT#"</body></html>"));
			};
        };
    };		   
    
  	public shared func wallet_receive() {
    	let amount = Cycles.available();
    	ignore Cycles.accept(amount);
  	};

	public query func get_data_store() : async Conversion.DataStoreView {
		return Conversion.convert_datastore_view(data_store);
	};

	public query func get_data_group (bundle_id: Text, group_id:CommonTypes.DataGroupId) : async Result.Result<Conversion.DataGroupView, CommonTypes.Errors> {
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				let group_opt = switch (group_id) {
					case (#POI) {bundle.payload.poi_group};
					case (#Additions) {bundle.payload.additions_group};
				};
				switch (group_opt) {
					case (?g) { return #ok(Conversion.convert_datagroup_view(g));};
					case (null) {return #err(#NotRegistered);};
				};
			};
			case (null) { return #err(#NotFound); };
		};
	};

	public query func available_cycles() : async Nat {
		return Cycles.balance();
  	};

	public query func get_version() : async Text {
		return Utils.VERSION;
	};

    public query func get_bundles_for_tag(tag:Text) : async List.List<Text> {
		switch (tags2bundle_get(tag)) {
			case (?bundle_ids) {
				bundle_ids;   
			};
			case (null) {
				List.nil();       
			};
		};
    };	      

	private func _is_operator(id: Principal) : Bool {
    	Option.isSome(Array.find(operators, func (x: Principal) : Bool { x == id }))
    };

	private func _apply_bundle_logo (bundle: Types.Bundle, logo : ?Types.DataPayload) : async Result.Result<(), CommonTypes.Errors> {
      	// account should be controlled by owner,                 
       	//  if (not (caller == bundle.owner)) return #err(#AccessDenied);		
		let bucket_actor : Types.Actor.DataBucketActor = actor (bundle.data_path.bucket_id);				
		// replace logo
		switch(logo) {
			case (?logo_val){
				// replace or save
				switch (bundle.logo) {
					case (?logo_path) { 
						ignore await bucket_actor.replace_resource(logo_path.resource_id, logo_val.value);};
					case (null) {
						let logo_result = await bucket_actor.store_resource(logo_val.value, {
							content_type = logo_val.content_type;
							name = "logo";
							parent_id = ?bundle.data_path.resource_id; parent_path = null; ttl = null; read_only = null;}
						);
						switch (logo_result) {
							case (#ok(l_path)) {	
								bundle.logo := ?{
									locale=null; 
									url=l_path.url; 
									bucket_id=l_path.partition; 
									resource_id=l_path.id;
								}
							};
							case (#err(_)) {return #err(#ActionFailed);};
						};
					};
				};
			};
			case (null) {
					// delete
				switch (bundle.logo) {
					case (?logo_path) { 
						ignore await bucket_actor.delete_resource(logo_path.resource_id);};
					// no errors, silently ignore if no logo uploaded
					case (null) { }
				}
		};
	}; 				
	return #ok();

	};

    private func _register_bundle(args : Types.BundleArgs, owner : CommonTypes.Identity) : async Result.Result<Text, CommonTypes.Errors> {
        // validate tags
		if (Array.size(args.tags) > MAX_TAGS) return #err(#InvalidRequest);
		for (tag in args.tags.vals()) {
  			if (Utils.invalid_tag_name(tag)) return #err(#InvalidRequest);
		};

		// increment counter
		_bundle_counter  := _bundle_counter + 1;
        let canister_id = Principal.toText(Principal.fromActor(this));
        let bundle_id = switch (MODES.identifier) {
            case (#Ordinal) {Nat.toText(_bundle_counter)};
            case (#Hash) { Utils.hash_time_based(canister_id, _bundle_counter)};
        };

		// init directory
		let bucket_id:Text = Utils.unwrap(data_store.active_bucket);
		let bucket_actor : Types.Actor.DataBucketActor = actor (bucket_id);
		let bundle_data = await bucket_actor.new_directory(false, {
			content_type = null;
			name = bundle_id;
			parent_path = null;
			parent_id = null;
			ttl = null;
			read_only = null;
		});		

		switch (bundle_data) {
			case (#ok(idUrl)) {

       			let tags_list = List.fromArray(Array.map<Text, Text>(args.tags, func t = Utils.normalize_tag(t)));
				let bundle:Types.Bundle = {
					data_path = {
						locale = null; 
						url = idUrl.url; 
						bucket_id = idUrl.partition; 
						resource_id = idUrl.id
					};
            		var name = args.name;
            		var description = args.description;
            		var logo = null;
            		var tags = tags_list;
            		var payload = {
						var poi_group = null;
						var additions_group = null;
					};
					creator = owner;
            		var owner = owner;
            		created = Time.now();
					var access_list = List.nil();
        		};
        		// put into store memory
        		bundles := Trie.put(bundles, Utils.text_key(bundle_id), Text.equal, bundle).0;
				// apply tags for bundle
				_include_tags (bundle_id, tags_list);

				// logo
				switch (args.logo) {
					case (?logo) {
						ignore await _apply_bundle_logo(bundle, ?{value=logo.value; content_type=logo.content_type});
					};
					case (null) { };
				};				

        		return #ok(bundle_id);				

			};
			case (#err(_)) {
				// we can throw this kind of error because it belong to the data bucket. Root directory was not created
				return #err(#DataStoreNotInitialized);
			};

		};
    };

	private func _exclude_tags (bundle_id:Text, tags: List.List<Text>) : () {
		for (tag in List.toIter(tags)) {
  			_exclude_tag(bundle_id, tag);
		};
	};

	private func _include_tags (bundle_id:Text, tags: List.List<Text>) : () {
		for (tag in List.toIter(tags)) {
  			_include_tag(bundle_id, tag);
		};
	};

    private func _include_tag(bundle_id:Text, tag:Text) : () {
		switch (tags2bundle_get(tag)) {
			case (?bundle_ids) {
				if (not List.isNil(bundle_ids)) {
					for (leaf in List.toIter(bundle_ids)){
						if (leaf == bundle_id) return;
					};
				};
				tags2bundle := Trie.put(tags2bundle, Utils.tag_key(tag), Text.equal, List.push(bundle_id, bundle_ids)).0;       
			};
			case (null) {
				tags2bundle := Trie.put(tags2bundle, Utils.tag_key(tag), Text.equal, List.push(bundle_id, List.nil())).0;       
			};
		};
    };

    private func _exclude_tag(bundle_id:Text, tag:Text) : () {
		switch (tags2bundle_get(tag)) {
			case (?bundle_ids) {
				if (not List.isNil(bundle_ids)) {
					let fbundles = List.mapFilter<Text, Text>(bundle_ids,
					func(b:Text) : ?Text {
						if (b == bundle_id) { return null; }
						else { return ?b; }
					}
					);
					tags2bundle := Trie.put(tags2bundle, Utils.tag_key(tag), Text.equal, fbundles).0;       
				};
			};
			case (null) {
			};
		};
    };	


    private func _register_tag(bundle_id:Text, tag:Text) : () {
		switch (tags2bundle_get(tag)) {
			case (?bundle_ids) {
				if (not List.isNil(bundle_ids)) {
					for (leaf in List.toIter(bundle_ids)){
						if (leaf == bundle_id) return;
					};
				};
				tags2bundle := Trie.put(tags2bundle, Utils.tag_key(tag), Text.equal, List.push(bundle_id, bundle_ids)).0;       
			};
			case (null) {
				tags2bundle := Trie.put(tags2bundle, Utils.tag_key(tag), Text.equal, List.push(bundle_id, List.nil())).0;       
			};
		};
    };	

	private func render_bundle_overview (canister_id: Text, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = initArgs.network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#0969DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (Utils.unwrap(r.logo)).url # "\" class=\"logo\">";
		};

		resource_html := resource_html # "<p><u>Created</u> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><b>Creaator</b> : "# debug_show(r.creator) # "</p>";
		resource_html := resource_html # "<p><u>Owner</u> : "# debug_show(r.owner) # "</p>";

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};


	private func render_bundle_details (canister_id: Text, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = initArgs.network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell_details\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#0969DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		resource_html := resource_html # "<p><i>"# r.description # "</i></p>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (Utils.unwrap(r.logo)).url # "\" class=\"logo_details\">";
		};
		resource_html := resource_html # "<p><b>ID</b> : "# debug_show(id) # "</p>";
		resource_html := resource_html # "<p><b>Root data path</b> : <a  href=\"" # r.data_path.url #"\" target = \"_blank\">"#r.data_path.url#"</a></p>";
		resource_html := resource_html # "<p><b>Created</b> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><b>Creaator</b> : "# debug_show(r.creator) # "</p>";
		resource_html := resource_html # "<p><b>Owner</b> : "# debug_show(r.owner) # "</p>";		
		
		switch (r.payload.poi_group) {
			case (?poi) {
				resource_html := resource_html # "<hr><p><b>'POI' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 5px 10px;\">created : <span class=\"js_date\">"# Int.toText(poi.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 5px 10px;\">path : <a  href=\"" # poi.data_path.url #"\" target = \"_blank\">"#poi.data_path.url#"</a></div>";
				if (Option.isSome(poi.readonly)) {
					resource_html := resource_html # "<div style=\"padding: 5px 10px;\">read only untill : <span class=\"js_date\">"# Int.toText(Utils.unwrap(poi.readonly)) # "</span></div>";
				};
				// render sections
				if (not List.isNil(poi.sections)){
					resource_html := resource_html # "<div style=\"padding: 5px 10px;\">sections :";
					for (section in List.toIter(poi.sections)) {
						resource_html := resource_html # "<span style=\"padding: 0 10px;\"><i>" # debug_show(section.category) #"</i></span>";
					};
					resource_html := resource_html # "</div>";	
				};					
			};
			case (null) {resource_html := resource_html # "<p><b>'POI' data group</b> : --- / --- </p>";}
		};

		switch (r.payload.additions_group) {
			case (?add) {
				resource_html := resource_html # "<hr><p><b>'Additions' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 5px 10px;\">created : <span class=\"js_date\">"# Int.toText(add.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 5px 10px;\">path : <a  href=\"" # add.data_path.url #"\" target = \"_blank\">"#add.data_path.url#"</a></div>";
				if (Option.isSome(add.readonly)) {
					resource_html := resource_html # "<div style=\"padding: 5px 10px;\">read only untill : <span class=\"js_date\">"# Int.toText(Utils.unwrap(add.readonly)) # "</span></div>";
				};
				// render sections
				if (not List.isNil(add.sections)){
					resource_html := resource_html # "<div style=\"padding: 5px 10px;\">sections :";
					for (section in List.toIter(add.sections)) {
						resource_html := resource_html # "<span style=\"padding: 0 10px;\"><i>" # debug_show(section.category) #"</i></span>";
					};
					resource_html := resource_html # "</div>";	
				};			
			};
			case (null) {resource_html := resource_html # "<p><b>'Additions' data group</b> : --- / --- </p>";}
		};

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<hr><p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};

	private func _apply_bundle_section (bundle: Types.Bundle, args : Types.DataPackageRawArgs) : async Result.Result<(), CommonTypes.Errors> {
		// assert the group is initialized
		let data_group:Types.DataGroup = switch (await _assert_data_group(bundle, args.group)) {
			case (#ok(g)){
				switch (g) {
					case (#POI) {Utils.unwrap(bundle.payload.poi_group);};
					case (#Additions) {Utils.unwrap(bundle.payload.additions_group);};
				}
			};
			case (#err(_)) { return #err(#ActionFailed); };
		};
		//Debug.print("_apply_bundle_section : group "#debug_show(args.group)#"; category "#debug_show(args.category)#"; name "#debug_show(args.name));

		// identify the section by category (it could be exteneded to identify the section by internal ID)
		// take into account the number of such files (counters)
		let target_section =  switch (_find_section(data_group,  args.category)) {
			case (?sec){
				Debug.print("     take existing section "#debug_show(sec.category) #" under "#debug_show(sec.data_path.resource_id));

				sec};
			case (null) {
				switch (await _init_data_section (data_group.data_path, args.category)) {
					case (#ok(r_path)) {
						let s : Types.DataSection = {
							data_path = r_path;
							category = args.category;
							var data =  List.nil();
							var active_upload = null;
							var counter = 0;
						};
						data_group.sections:= List.push(s, data_group.sections)	;
						s;				
					};
					case (#err(_)) { return #err(#ActionFailed); };
				};
			}
		};
		
		let replace_path:?CommonTypes.ResourcePath = null;
		//List.find(target_section.data , func (k:CommonTypes.ResourcePath):Bool { Option.get(k.locale, "") == Option.get(args.locale, "")});
		switch (args.action) {
			// upload binary data till 2mb
			case (#Upload) {
				// active chunk upload has not completed yet
				if (Option.isSome(target_section.active_upload)) return #err(#OperationNotAllowed);
				target_section.counter:=target_section.counter + 1;
				// resolve final name
				let resource_name = switch (args.name) {
					case (?name) {name;};
					case (null) {Utils.resolve_resource_name(args.category, args.locale, ?Nat.toText(target_section.counter))};
				};
				// resource_path
				let section_path:CommonTypes.ResourcePath = switch (await _submit_data(target_section.data_path,
						replace_path, resource_name, args.locale, args.payload)) {
					case (#ok(data)){ data; };
					case (#err(e)) { return #err(e); };
				};
				//  update the existing section
				target_section.data:= List.push(section_path, target_section.data);
			};
			case (#UploadChunk) {
				let bucket_actor : Types.Actor.DataBucketActor = actor (target_section.data_path.bucket_id);
				switch (target_section.active_upload) {
					case (?attempt) {ignore await bucket_actor.store_chunk(args.payload.value, ?attempt.binding_key);};
					case (null) {
						let binding_key = Utils.hash_time_based(bundle.data_path.resource_id, Int.abs(Time.now()));
						target_section.active_upload:= ?{
							binding_key=binding_key;
							locale  = null;
							created = Time.now();
						};
						ignore await bucket_actor.store_chunk(args.payload.value, ?binding_key);
					};
				}
			};
			case (#Package) {
				let bucket_actor : Types.Actor.DataBucketActor = actor (target_section.data_path.bucket_id);

				switch (target_section.active_upload) {
					case (?attempt) {
						target_section.counter:=target_section.counter + 1;
						// resolve final name
						let resource_name = switch (args.name) {
							case (?name) {name;};
							case (null) {Utils.resolve_resource_name(args.category, args.locale, ?Nat.toText(target_section.counter))};
						};

						let res = await bucket_actor.commit_batch_by_key(attempt.binding_key, {
							content_type = args.payload.content_type;
							name = resource_name;
							parent_id = ?target_section.data_path.resource_id;
							parent_path = null; ttl = null; read_only = null;
						});
						let section_path:CommonTypes.ResourcePath = switch (res) {
							case (#ok(r)) {{locale=args.locale; url = r.url; bucket_id = r.partition; resource_id = r.id};};
							case (#err (e)) { return #err(e)};
						};
						target_section.data:= List.push(section_path, target_section.data);
						target_section.active_upload:= null;						
					};
					case (null) { return #err(#OperationNotAllowed); };
				}						
			};
		};
		return #ok();
	};

	private func _assert_data_group (bundle: Types.Bundle, group_id:CommonTypes.DataGroupId) : async Result.Result<CommonTypes.DataGroupId, CommonTypes.Errors> {
		// init group if needed
		let data_group:Types.DataGroup = switch (group_id) {
			case (#POI) {
				switch (bundle.payload.poi_group) {
					case (?g) {g;};
					case (null) {
						let poi_group:Types.DataGroup = switch (await _init_data_group(bundle.data_path, #POI)) {
							case (#ok(r_path)) {
								let g:Types.DataGroup = { data_path = r_path; var sections = List.nil(); created = Time.now(); var readonly = null; var access_list = List.nil();};
								bundle.payload.poi_group := ?g;
								g;
							};
							case (#err(_)) { return #err(#ActionFailed); };
						};
					}
				};
			};
			case (#Additions) {
				switch (bundle.payload.additions_group) {
					case (?g) {g;};
					case (null) {
						let additions_group:Types.DataGroup = switch (await _init_data_group(bundle.data_path, #Additions)) {
							case (#ok(r_path)) {
								let g:Types.DataGroup = { data_path = r_path; var sections = List.nil(); created = Time.now(); var readonly = null; var access_list = List.nil();};
								bundle.payload.additions_group := ?g;
								g;
							};
							case (#err(_)) { return #err(#ActionFailed); };
						};
					}
				};
			}				
		};
		#ok(group_id);
	};

	private func _init_data_group (root_path : CommonTypes.ResourcePath, group_id : CommonTypes.DataGroupId) : async Result.Result<CommonTypes.ResourcePath, CommonTypes.Errors> {
		let bucket_actor : Types.Actor.DataBucketActor = actor (root_path.bucket_id);
		let res = await bucket_actor.new_directory(false, {
			content_type = null;
			name =  Utils.resolve_group_name(group_id);
			parent_path = null;
			parent_id = ?root_path.resource_id;
			ttl = null;
			read_only = null;
		});
		switch (res) {
			case (#ok(r)) {	#ok({locale=null; url = r.url; bucket_id = r.partition; resource_id = r.id});	};
			case (#err (e)) { return #err(#ActionFailed)};
		};
	};

	private func _init_data_section (root_path : CommonTypes.ResourcePath, category : CommonTypes.CategoryId) : async Result.Result<CommonTypes.ResourcePath, CommonTypes.Errors> {
		let bucket_actor : Types.Actor.DataBucketActor = actor (root_path.bucket_id);
		Debug.print("     init new section "#debug_show(category) #" under "#debug_show(root_path.resource_id));

		let res = await bucket_actor.new_directory(false, {
			content_type = null;
			name =  Utils.resolve_category_name(category);
			parent_path = null;
			parent_id = ?root_path.resource_id;
			ttl = null;
			read_only = null;
		});
		switch (res) {
			case (#ok(r)) {	#ok({locale=null; url = r.url; bucket_id = r.partition; resource_id = r.id});	};
			case (#err (e)) { return #err(#ActionFailed)};
		};
	};

	private func _build_identity (caller : Principal) : CommonTypes.Identity {
		// right now we return always ICP, but it will be extended in case of ethereum authentication
		// in case of Ethereum support, then we have to call other authentication service to find a session-based principal
		// right now we always return ICP identity
		{
			identity_type = #ICP;
			identity_id = Principal.toText(caller);
		};
	};

	private func _access_allowed (bundle:Types.Bundle, identity: CommonTypes.Identity, group: ?CommonTypes.DataGroupId): Bool {
			switch (group) {
				// check based on the specified group
				case (?g) {
					let group_opt = switch (g) {
						case (#POI) {bundle.payload.poi_group;};
						case (#Additions) {bundle.payload.additions_group;}
					};
					// if group present --> check access_list, else compare with owner
					switch (group_opt) {
						// check on group
						case (?group_obj) {
							if (not List.isNil(group_obj.access_list)) {
								Option.isSome(List.find(group_obj.access_list , func (k:CommonTypes.Identity):Bool { Utils.identity_equals(identity, k)}))
							} else Utils.identity_equals(identity, bundle.owner); 						
						};
						// // check on bundle
						case (null) { Utils.identity_equals(identity, bundle.owner) };
					};
				};
				// check based on bundle level only
				case (null) { 
					if (not List.isNil(bundle.access_list)) {
						Option.isSome(List.find(bundle.access_list , func (k:CommonTypes.Identity):Bool { Utils.identity_equals(identity, k)}))
					} else Utils.identity_equals(identity, bundle.owner); }
			};
	};

	private func _find_section (data_group: Types.DataGroup, category: CommonTypes.CategoryId) : ?Types.DataSection {
		return List.find(data_group.sections , func (k:Types.DataSection):Bool { k.category == category});
	};

	private func _exclude_section (data_group: Types.DataGroup, category: CommonTypes.CategoryId) : () {
		data_group.sections := List.mapFilter<Types.DataSection, Types.DataSection>(data_group.sections,  func (k:Types.DataSection) = if (k.category == category) { null } else { ?k });	
	};	

	private func _register_bucket(name:Text, operators : [Principal], cycles : Nat): async Text {
		Cycles.add(cycles);
		let bucket_actor = await DataBucket.DataBucket({
			// apply the user account as operator of the bucket
			name = name;
			operators = operators;
			network = initArgs.network;
			access_type = #Public;
			access_token = null;
		});

		let bucket_principal = Principal.fromActor(bucket_actor);
		// IC Application is a controller of the bucket. but other users could be added here
		//if (Array.size(initArgs.spawned_canister_controllers) > 0){
		/*ignore management_actor.update_settings({
			canister_id = bucket_principal;
			settings = { controllers = ? Utils.include(initArgs.spawned_canister_controllers, Principal.fromActor(this));};
		});*/
		return Principal.toText(bucket_principal);
	};    


}