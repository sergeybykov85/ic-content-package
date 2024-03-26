import Prelude "mo:base/Prelude";
import Prim "mo:⛔";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Trie "mo:base/Trie";
import TrieSet "mo:base/TrieSet";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Option "mo:base/Option";

import CommonTypes "./CommonTypes";

module {

    public let ROOT = "/";

    public let DEF_REMAINDER_CYCLES: Nat = 20_000_000_000;

    public func text_key(id: Text) : Trie.Key<Text> = { key = id; hash = Text.hash id };

   
    public func identity_equals (identity1: CommonTypes.Identity, identity2: CommonTypes.Identity) : Bool {
		return (identity1.identity_type == identity2.identity_type
		and identity1.identity_id == identity2.identity_id);
	};

    public func find_text (t:Text): (k:Text) -> Bool {
		func (k:Text):Bool { t == k};
	};

    public func find_identity (identity:CommonTypes.Identity): (k:CommonTypes.Identity) -> Bool {
		func (k:CommonTypes.Identity):Bool { identity_equals(identity, k)};
	};

    public func get_identity_key (identity: CommonTypes.Identity) : Text {
        Text.map(_resolve_identity_type(identity.identity_type)#"@"#identity.identity_id , Prim.charToLower);
    }; 
  
    public func identity_key(identity: CommonTypes.Identity) : Trie.Key<Text>  { 
        let _k = get_identity_key(identity);
        {key = _k; hash = Text.hash (_k) }
    };

    public func unwrap<T>(x: ?T) : T {
        switch x {
            case null { Prelude.unreachable() };
            case (?x_) { x_ };
        }
    }; 

    private func _resolve_identity_type (identity_type: CommonTypes.IdentityType) : (Text) {
        switch (identity_type) {
            case (#ICP) { "ICP"};
            case (#EvmChain) {"ETH"};
        };
    };

    public func list_exclude (list:List.List<Text>, id:Text): List.List<Text> {
        List.mapFilter<Text, Text>(list, func(b:Text) : ?Text { if (b == id) { return null; } else { return ?b; }});
    };

    public func build_uniq (arrays: [[Text]]) : [Text] {
         var set = TrieSet.empty<Text>();
         for (array in arrays.vals()) {
            for (a in array.vals()) {
                set := TrieSet.put(set, a, Text.hash(a), Text.equal);
            }
         };
         TrieSet.toArray(set);
    }; 

    public func flatten (to : [?[Text]]) : [[Text]] {
        var r = Buffer.Buffer<[Text]>(Array.size(to));
        for (a in to.vals()) {
            switch (a) {
                case (?i) { r.add(i); };
                case (null) {};
            }
        };
        Buffer.toArray(r);
    };

    public func build_intersect(arrays : [[Text]]) : [Text] {
        if (arrays.size() == 0) return [];
        // take 1st array
        let array_1:[Text] = arrays[0];
        let size = arrays.size();
        if (size == 1) return array_1;
        let intersect = Buffer.Buffer<Text>(size);

        for (id in Iter.fromArray(array_1)) {
            var is_intersect = true;
            let arrays_from_2 = Array.subArray<[Text]>(arrays, 1, size-1);
            label l for (array_from_2 in Iter.fromArray(arrays_from_2)) {
                if (Option.isNull(Array.find(array_from_2, func (a: Text) : Bool { a == id } ))) {
                    is_intersect := false;
                    break l; 
                };
            };
            if (is_intersect) { intersect.add(id);};
        };
        Buffer.toArray(intersect);
    };


	public func get_page<T, V>(ids:[Text], start: Nat, limit: Nat, get : (id : Text) -> ?V, conversion : (V, Text) -> T):  CommonTypes.DataSlice<T> {
        let res = Buffer.Buffer<T>(limit);
        var i = start;
        while (i < start + limit and i < ids.size()) {
			let id = ids[i];
			switch (get(id)) {
				case (?w) { res.add(conversion(w, id)) };
				case (null) {  };
			};
            i += 1;
        };
        return {items = Buffer.toArray(res); total_supply = Array.size(ids); };
    };

    public func get_items_by_ids<T, V>(ids:[Text],  get : (id : Text) -> ?V, conversion : (V, Text) -> T) : [T] {
		let res = Buffer.Buffer<T>(Array.size(ids));
		for (id in ids.vals()) {
			switch (get(id)) {
				case (?w) { res.add(conversion(w, id))};
				case (null) {  };
			};
		};
		Buffer.toArray(res);
    };            

};
