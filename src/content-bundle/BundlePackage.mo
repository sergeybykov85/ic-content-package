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

import Http "./Http";
import Types "./Types";
import Utils "./Utils";

shared (installation) actor class BundlePackage(initArgs : Types.BundlePackageArgs) = this {

	let MAX_TAGS = 5;
	let DEF_CSS =  "<style>" # Utils.DEF_BODY_STYLE #
	".grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; } "#
	".grid_details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; } "#
	".logo { max-height:200px; margin: 1em auto; display:block; } .logo_details { max-height:300px; margin: 1em auto; display:block; } "#
	".cell { min-height: 100px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } "#
	".cell_details { min-height: 250px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } "#
	".tag { color:#0969DA; margin: 0 4px; border: 1px solid #0969DA; border-radius: 8px; padding: 4px 10px; background-color:#B6E3FF;} "#
	".access_tag { color:white; font-size:large; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: absolute; right: 20px; top: 1px; background-color:#636466;} </style>";


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
	public shared ({ caller }) func register_bundle (args : Types.BundleArgs) : async Result.Result<Text, Types.Errors> {
		// different restrictions based on the mode
        switch (MODES.submission) {
            case (#Installer) {
                if (not (caller == OWNER or _is_operator(caller))) return #err(#AccessDenied);
                await _register_bundle(args, {identity_type=#ICP; identity_id=Principal.toText(caller)});
            };
            case (#Public) {
                await _register_bundle(args, {identity_type=#ICP; identity_id=Principal.toText(caller)});
            };
            case (#ACL) {
                if (not (caller == OWNER or _is_operator(caller))) return #err(#AccessDenied);
                await _register_bundle(args, {identity_type=#ICP; identity_id=Principal.toText(caller)});
            };
        };
    };

	/**
	* Updates an existing bundle, just override  description, tags, logo and if they specified
	* Allowed only to the owner of the bundle.
	*/
	public shared ({ caller }) func update_bundle (id: Text, args : Types.BundleUpdateArgs) : async Result.Result<Text, Types.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
            	// account should be controlled by owner,                 
              	//  if (not (caller == bundle.owner)) return #err(#AccessDenied);		
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
	public shared ({ caller }) func apply_bundle_logo (id: Text, logo : ?Types.DataPayload) : async Result.Result<Text, Types.Errors> {
		switch (bundle_get(id)) {
			case (?bundle) {
				ignore await _apply_bundle_logo(bundle, logo);
				return #ok(id);
			};
			case (null) { return #err(#NotFound); };
		};
	};

	public shared ({ caller }) func apply_bundle_section (bundle_id: Text, args : Types.DataPackageArgs) : async Result.Result<Text, Types.Errors> {
		if (Option.isNull(data_store.active_bucket)) return #err(#DataStoreNotInitialized);
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				ignore await _apply_bundle_section(bundle, args, {keys = null; transform = #None});
				return #ok(bundle_id);
			};
			case (null) { return #err(#NotFound); };
		};
	};	

	/**
	* Init a store, creating a 1st data bucket
	* Allowed only to the owner 
	*/
	public shared ({ caller }) func init_data_store (cycles : ?Nat) : async Result.Result<Text, Types.Errors> {
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
	public shared ({ caller }) func new_data_bucket (cycles : ?Nat) : async Result.Result<Text, Types.Errors> {
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

	private func _submit_data (root_path:Types.ResourcePath, replace_path:?Types.ResourcePath, name:Text, locale:?Text, payload : Types.DataPayload, 
			options : Types.TransformOptions) : async Result.Result<Types.ResourcePath, Types.Errors> {
		let bucket_actor : Types.Actor.DataBucketActor = actor (root_path.bucket_id);
		// transform if needed
		let blob_to_save = switch (options.transform) {
			case (#Json) {
				switch (JSON.toText(payload.value, Option.get(options.keys, []), null)){
				case (#ok(j)) {Text.encodeUtf8(j); };
				case (#err (e)) { return #err(#ActionFailed)};}				
			};
			case (#None) {payload.value;};
		};
		let res = switch (replace_path) {
			case (?replace) {
				await bucket_actor.replace_resource(replace.resource_id, blob_to_save);						
			};
			case (null) {
				await bucket_actor.store_resource(blob_to_save, {
					content_type = payload.content_type;
					name = name;
					parent_id = ?root_path.resource_id;
					parent_path = null; ttl = null; read_only = null;
				});
			};
		};
				
		switch (res) {
			case (#ok(r)) {	#ok({locale=locale; url = r.url; bucket_id = r.partition; resource_id = r.id});	};
			case (#err (e)) { return #err(#ActionFailed)};
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
						Debug.print("Searching Bundles for tag "#t); 
						out_html:=out_html # "<h3>Bundles <span class=\"tag\">" # t # "</span></h3><div class=\"grid\">";
						let n_tag = Utils.normalize_tag(t);
						switch (tags2bundle_get(n_tag)) {
							case (?bundle_ids) {
								Debug.print("Bundles for tag. Bundles "#debug_show(bundle_ids)); 
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

	public query func get_data_store() : async Types.DataStoreView {
		return Utils.datastore_view(data_store);
	};

	public query func get_data_group (bundle_id: Text, group_id:Types.DataGroupId) : async Result.Result<Types.DataGroupView, Types.Errors> {
		switch (bundle_get(bundle_id)) {
			case (?bundle) {
				let group_opt = switch (group_id) {
					case (#POI) {bundle.payload.poi_group};
					case (#Additions) {bundle.payload.additions_group};
				};
				switch (group_opt) {
					case (?g) { return #ok(Utils.datagroup_view(g));};
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

	private func _apply_bundle_logo (bundle: Types.Bundle, logo : ?Types.DataPayload) : async Result.Result<(), Types.Errors> {
      	// account should be controlled by owner,                 
       	//  if (not (caller == bundle.owner)) return #err(#AccessDenied);		
		let bucket_actor : Types.Actor.DataBucketActor = actor (bundle.data_path.bucket_id);				
		// replace logo
		switch(logo) {
			case (?logo_val){
				// replace or save
				switch (bundle.logo) {
					case (?logo_path) { ignore await bucket_actor.replace_resource(logo_path.resource_id, logo_val.value);};
					case (null) {
						let logo_result = await bucket_actor.store_resource(logo_val.value, {
							content_type = logo_val.content_type;
							name = "logo";
							parent_id = null; parent_path = null; ttl = null; read_only = null;}
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
				case (?logo_path) { ignore await bucket_actor.delete_resource(logo_path.resource_id);};
				// no errors, silently ignore if no logo uploaded
				case (null) { }
			}
		};
	}; 				
	return #ok();

	};

    private func _register_bundle(args : Types.BundleArgs, owner : Types.Identity) : async Result.Result<Text, Types.Errors> {
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
            		owner = owner;
            		created = Time.now();
        		};
        		// put into store memory
        		bundles := Trie.put(bundles, Utils.text_key(bundle_id), Text.equal, bundle).0;
				// apply tags for bundle
				_include_tags (bundle_id, tags_list);

				// logo
				switch (args.logo) {
					case (?logo) {
						let logo_result = await bucket_actor.store_resource(logo.value, {
							content_type = logo.content_type;
							name = "logo";
							parent_id = ?idUrl.id; parent_path = null; ttl = null; read_only = null;}
						);
						switch (logo_result) {
							case (#ok(l_path)) {	
								bundle.logo:=?{
									locale=null; 
									url=l_path.url; 
									bucket_id=bucket_id; 
									resource_id=l_path.id;
								}
							};
							case (#err(_)) {};
						};
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
		
		switch (r.payload.poi_group) {
			case (?poi) {
				resource_html := resource_html # "<p><b>'POI' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 0 10px;\">created : <span class=\"js_date\">"# Int.toText(poi.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 0 10px;\">path : <a  href=\"" # poi.data_path.url #"\" target = \"_blank\">"#poi.data_path.url#"</a></div>";
			};
			case (null) {resource_html := resource_html # "<p><b>'POI' data group</b> : --- / --- </p>";}
		};

		switch (r.payload.additions_group) {
			case (?add) {
				resource_html := resource_html # "<p><b>'Additions' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 0 10px;\">created : <span class=\"js_date\">"# Int.toText(add.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 0 10px;\">path : <a  href=\"" # add.data_path.url #"\" target = \"_blank\">"#add.data_path.url#"</a></div>";
			};
			case (null) {resource_html := resource_html # "<p><b>'Additions' data group</b> : --- / --- </p>";}
		};


		resource_html := resource_html # "<p><u>Created</u> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><u>Owner</u> : "# debug_show(r.owner) # "</p>";

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};

	private func _apply_bundle_section (bundle: Types.Bundle, args : Types.DataPackageArgs, options : Types.TransformOptions) : async Result.Result<(), Types.Errors> {
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
			// identify the section by category (it could be exteneded to identify the section by internal ID)
		let target_section = List.find(data_group.sections , func (k:Types.DataSection):Bool { k.category == args.category});
			// take into account the number of such files (counters)
		let res_meta = Utils.resolve_resource_metadata(args.category, args.locale);

		var replace_path:?Types.ResourcePath = null;
		var active_upload :?Types.ChunkUploadAttempt = null;
		if (Option.isSome(target_section)){
			let sec = Utils.unwrap(target_section);
			replace_path := List.find(sec.data , func (k:Types.ResourcePath):Bool { Option.get(k.locale, "") == Option.get(args.locale, "")});
			active_upload := sec.active_upload;
		};
		switch (args.action) {
			// upload binary data till 2mb
			case (#Upload) {
				// active chunk upload has not completed yet
				if (Option.isSome(active_upload)) return #err(#OperationNotAllowed);
				// resource_path
				let section_path:Types.ResourcePath = switch (await _submit_data(data_group.data_path,replace_path,
															 res_meta.0, args.locale, args.payload, options)) {
					case (#ok(data)){ data; };
					case (#err(_)) { return #err(#ActionFailed); };
				};
					// register a new section or update the existing section
				switch (target_section) {
					case (?section) { section.data:= List.push(section_path, section.data); };
					case (null) {
						data_group.sections:= List.push ({
							category = args.category;
							var data =  List.push(section_path, null);
							var active_upload = null;
						}:Types.DataSection, null);
					};
				};
			};
			case (#UploadChunk) {
				let bucket_actor : Types.Actor.DataBucketActor = actor (data_group.data_path.bucket_id);
				switch (active_upload) {
					case (?attempt) {ignore await bucket_actor.store_chunk(args.payload.value, ?attempt.binding_key);};
					case (null) {
						let binding_key = Utils.hash_time_based(bundle.data_path.resource_id, Int.abs(Time.now()));
						active_upload:= ?{
							binding_key=binding_key;
							locale  = null;
							created = Time.now();
						};
						ignore await bucket_actor.store_chunk(args.payload.value, ?binding_key);
						switch (target_section) {
							case (?section) {section.active_upload:= active_upload;	};
							case (null) {
								data_group.sections:= List.push ({
									category = args.category;
									var data =  List.nil();
									var active_upload = active_upload;
								}:Types.DataSection, null);
							};
						};								
					};
				}
			};
			case (#Package) {
				let bucket_actor : Types.Actor.DataBucketActor = actor (data_group.data_path.bucket_id);
				switch (active_upload) {
					case (?attempt) {
						let res = await bucket_actor.commit_batch_by_key(attempt.binding_key, {
							content_type = args.payload.content_type;
							name = res_meta.0;
							parent_id = ?bundle.data_path.resource_id;
							parent_path = null; ttl = null; read_only = null;
						});
						let section_path:Types.ResourcePath = switch (res) {
							case (#ok(r)) {{locale=args.locale; url = r.url; bucket_id = r.partition; resource_id = r.id};};
							case (#err (e)) { return #err(#ActionFailed)};
						};
						switch (target_section) {
							case (?section) {
								section.data:= List.push(section_path, section.data);
								section.active_upload:= null;
							};
							case (null) {
								data_group.sections:= List.push ({
									category = args.category;
									var data =  List.push(section_path, null);
									var active_upload = null;
								}:Types.DataSection, null);
							};
						};																
					};
					case (null) { return #err(#OperationNotAllowed); };
				}						
			};
		};
		return #ok();
	};



	private func _assert_data_group (bundle: Types.Bundle, group_id:Types.DataGroupId) : async Result.Result<Types.DataGroupId, Types.Errors> {
		// init group if needed
		let data_group:Types.DataGroup = switch (group_id) {
			case (#POI) {
				switch (bundle.payload.poi_group) {
					case (?g) {g;};
					case (null) {
						let poi_group:Types.DataGroup = switch (await _init_data_group(bundle.data_path, #POI)) {
							case (#ok(r_path)) {
								let g:Types.DataGroup = { data_path = r_path; var sections = List.nil(); created = Time.now()};
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
								let g:Types.DataGroup = { data_path = r_path; var sections = List.nil(); created = Time.now()};
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

	private func _init_data_group (root_path : Types.ResourcePath, group_id : Types.DataGroupId) : async Result.Result<Types.ResourcePath, Types.Errors> {
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