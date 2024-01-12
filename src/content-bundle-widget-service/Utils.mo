import Blob "mo:base/Blob";
import Char "mo:base/Char";

import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import List "mo:base/List";
import Time "mo:base/Time";

import SHA256 "mo:motoko-sha/SHA256";

module {

    let HEX_SYMBOLS =  [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'a', 'b', 'c', 'd', 'e', 'f',
    ]; 
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
    * Generates a hex string based on array of Nat8
    */
    public func to_hex(arr: [Nat8]): Text {
        Text.join("", Iter.map<Nat8, Text>(Iter.fromArray(arr), func (x: Nat8) : Text {
            let c1 = HEX_SYMBOLS[Nat8.toNat(x / 16)];
            let c2 = HEX_SYMBOLS[Nat8.toNat(x % 16)];
            Char.toText(c1) # Char.toText(c2);
        }))
    };


};
