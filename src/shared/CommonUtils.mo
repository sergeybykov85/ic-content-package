import Prelude "mo:base/Prelude";
import Prim "mo:⛔";
import Text "mo:base/Text";
import Trie "mo:base/Trie";

import CommonTypes "./CommonTypes";

module {

    public let ROOT = "/";

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

};
