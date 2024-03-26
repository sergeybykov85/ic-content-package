import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Iter "mo:base/Iter";
import Prim "mo:⛔";
import Text "mo:base/Text";
import Trie "mo:base/Trie";
import List "mo:base/List";
import Option "mo:base/Option";

import CommonTypes "../shared/CommonTypes";
import Types "./Types";

module {
    public let ROOT = "/";

    let INDEX_ROUTE = "/i/";  
    let PARAM_TYPE = "type";  

    private type ResourceUrlArgs = {
        resource_id : Text;
        canister_id : Text;
        network : CommonTypes.Network;
        view_mode : Types.ViewMode;
    };

   
    public func normalize (token : Text) : Text {
        Text.map(token , Prim.charToLower);
    };

    public func submission_key(id: Text) : Trie.Key<Text> = { key = normalize(id); hash = Text.hash (normalize(id)) };

    /**
    * Builds resource url based on specified params (id, network, view mode)
    */
    public func build_resource_url(args : ResourceUrlArgs) : Text {
        let router_id = switch (args.view_mode) {
            // only Index is supported for the PackageRegistry for now
            case (_) {INDEX_ROUTE};
        };

        switch (args.network){
            case (#Local(location)) return Text.join("",(["http://", args.canister_id, ".", location, router_id, args.resource_id].vals()));
            case (#IC) return Text.join("", (["https://", args.canister_id, ".raw.icp0.io", router_id, args.resource_id].vals()));
        };
    };

    public func get_resource_id(url : Text) : ?Types.RequestedObject {
        if (Text.startsWith(url, #text INDEX_ROUTE)) {
            let path = Option.get(Text.stripStart(url, #text INDEX_ROUTE),"");
            if (path == "" or Text.startsWith(path, #char '?')) {
                return ?{
                    id = ROOT;
                    view_mode = #Index;
                    // only for the root
                    submission_type = _fetch_param_from_uri(url, PARAM_TYPE);
                };  
            };
            return ?{
                id = _fetch_id_from_uri(url);
                view_mode = #Index;
                submission_type = null;
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


    public func resolve_submission_name (submission: Types.Submission) : (Text) {
        switch (submission) {
            case (#Public) { "Public"};
            case (#Private) { "Private"};
            case (#Shared) { "Shared"};
        };
    };

};
