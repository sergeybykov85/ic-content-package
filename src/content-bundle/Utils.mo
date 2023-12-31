import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Char "mo:base/Char";
import Cycles "mo:base/ExperimentalCycles";
import Float "mo:base/Float";

import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Prelude "mo:base/Prelude";
import Prim "mo:⛔";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Buffer "mo:base/Buffer";
import List "mo:base/List";
import Option "mo:base/Option";

import SHA256 "mo:motoko-sha/SHA256";

import CommonTypes "../shared/CommonTypes";
import Types "./Types";

module {
    public let VERSION = "0.1";
    public let DEF_BUCKET_CYCLES:Nat = 500_000_000_000;
    public let ROOT = "/";
    public let LOGO:Text = "logo";

    let HEX_SYMBOLS =  [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
    ]; 
    let NOT_ALLOWED_FOR_TAG = ['\u{22}',' ', '/',',','#', '@', '?', '+',';',':','$','=','[',']','~','^','|','<','>','{','}'];


    let INDEX_ROUTE = "/i/";  
    let RESOURCE_ROUTE = "/r/";  
    let PARAM_TAG = "tag";  

    private type ResourceUrlArgs = {
        resource_id : Text;
        canister_id : Text;
        network : CommonTypes.Network;
        view_mode : Types.ViewMode;
        route : ?Types.Route;
    };

    // 1MB
    let MB_IN_BYTES:Int = 1_048_576; 

    /**
    * Generates hash based on a prefix, current time and suffix (counter).
    * It is used to generate ids.
    * Since the time it is a part pf the hash, then it is difficult to preditc the next id
    */
    public func hash_time_based (prefix : Text, suffix : Nat) : Text {
        let message = SHA256.sha256(Blob.toArray(Text.encodeUtf8(prefix # Int.toText(Time.now()) # Nat.toText(suffix))));
        return to_hex(message);
    };
    /**
    * Generates hash based on a prefix and array of strings
    */
    public func hash (prefix : Text, items : [Text]) : Text {
        let message = SHA256.sha256(Blob.toArray(Text.encodeUtf8(prefix # Text.join("", items.vals()))));
        return to_hex(message);
    };    

    public func get_memory_in_mb() : Int {
        return _metric_to_mb(Prim.rts_memory_size());
    };

    public func get_heap_in_mb() : Int {
        return _metric_to_mb(Prim.rts_heap_size());
    };

    public func get_cycles_balance() : Int {
        return Cycles.balance();
    };

    
    /**
    * Generates a hex string based on array of Nat8
    */
    public func to_hex(arr: [Nat8]): Text {
        Text.join("", Iter.map<Nat8, Text>(Iter.fromArray(arr), func (x: Nat8) : Text {
            let c1 = HEX_SYMBOLS[Nat8.toNat(x / 16)];
            let c2 = HEX_SYMBOLS[Nat8.toNat(x % 16)];
            Char.toText(c1) # Char.toText(c2);
        }))
    };

    public func normalize_tag (token : Text) : Text {
        let x = Text.map(token , Prim.charToLower);
    };

    public func tag_key(id: Text) : Trie.Key<Text> = { key = normalize_tag(id); hash = Text.hash (normalize_tag(id)) };

    public func invalid_tag_name (name : Text) : Bool {
        Text.contains(name, #predicate (func(c) { Option.isSome(Array.find(NOT_ALLOWED_FOR_TAG, func (x: Char) : Bool { x == c } ))  })  );
    };

    public func un_escape_browser_token (token : Text) : Text {
        Text.replace(Text.replace(token, #text "%20", " "), #text "%2B", "+")
    };

    public func is_readonly (r: Types.DataGroup) : Bool {
		if (Option.isSome(r.readonly)) { 
			return (Time.now() < Option.get(r.readonly, 0));
		};
		return false;	
	};	

    /**
    * Builds resource url based on specified params (id, network, view mode)
    */
    public func build_resource_url(args : ResourceUrlArgs) : Text {
        let router_id = switch (args.view_mode) {
            case (#Index) {INDEX_ROUTE};
            // it is ok to use RESOURCE_ROUTE always for  now
            case (#Open) {RESOURCE_ROUTE};
        };
        switch (args.network){
            case (#Local(location)) return Text.join("",(["http://", args.canister_id, ".", location, router_id, args.resource_id].vals()));
            case (#IC) return Text.join("", (["https://", args.canister_id, ".raw.icp0.io", router_id, args.resource_id].vals()));
        };
    };

    public func get_resource_id(url : Text) : ?Types.RequestedObject {

        if (Text.startsWith(url, #text RESOURCE_ROUTE) ) {
            let path = Option.get(Text.stripStart(url, #text RESOURCE_ROUTE), "");
            if (path == "" or Text.startsWith(path, #char '?'))  return null;

            return ?{
                id = _fetch_id_from_uri(url);
                view_mode = #Open;
                route = #Asset;
                tag = null;
            };
        };       
        if (Text.startsWith(url, #text INDEX_ROUTE)) {
            let path = Option.get(Text.stripStart(url, #text INDEX_ROUTE),"");
            if (path == "" or Text.startsWith(path, #char '?')) {
                let tag = switch (_fetch_param_from_uri(url, PARAM_TAG)) {
                    case (?t) {?un_escape_browser_token(t)};
                    case (null) {null};
                };

                return ?{
                    id = ROOT;
                    view_mode = #Index;
                    route = #Bundle;
                    // only for the root
                    tag = tag;
                };  
            };
            return ?{
                id = _fetch_id_from_uri(url);
                view_mode = #Index;
                route = #Bundle;
                tag = null;
            };                
        };

        return null;
    };      

    private func _fetch_id_from_uri (url: Text): Text {
        let url_split : [Text] = Iter.toArray(Text.tokens(url, #char '/'));
        let last_token : Text = url_split[url_split.size() - 1];
        let filter_query_params : [Text] = Iter.toArray(Text.tokens(last_token, #char '?'));
        return filter_query_params[0];
    };

    private func _fetch_param_from_uri (url : Text, param : Text) : ?Text {
        let filter_query_params : [Text] = Iter.toArray(Text.tokens(url, #char '?'));
        if (Array.size(filter_query_params) == 2) {
            var t : ?Text = null;
            Iter.iterate<Text>(Text.split(filter_query_params[1], #text("&")), 
                func(x, _i) {
                    let param_entry = Iter.toArray(Text.split(x, #text("=")));
                    if (Array.size(param_entry) == 2) {
                        if (param_entry[0] == param) t:=?param_entry[1];
                    }
                });
            return t;
        } else return null;
    };         

    private func _metric_to_mb(v: Nat) : Int {
        let v_in_mb = Float.toInt(Float.abs(Float.fromInt(v) / Float.fromInt(MB_IN_BYTES)));
        return v_in_mb;
    };

    public func join<T>(a: [T], b:[T]) : [T] {
		// Array.append is deprecated and it gives a warning
    	let capacity : Nat = Array.size(a) + Array.size(b);
    	let res = Buffer.Buffer<T>(capacity);
    	for (p in a.vals()) { res.add(p); };
    	for (p in b.vals()) { res.add(p); };
    	Buffer.toArray(res);
    };

    public func include<T>(a: [T], b : T) : [T] {
		// Array.append is deprecated and it gives a warning
    	let capacity : Nat = Array.size(a) + 1;
    	let res = Buffer.Buffer<T>(capacity);
    	for (p in a.vals()) { res.add(p); };
    	res.add(b);        
    	Buffer.toArray(res);
    };

};
