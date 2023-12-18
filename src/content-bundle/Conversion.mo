
import List "mo:base/List";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import { JSON; Candid } "mo:serde";
import Result "mo:base/Result";

import Types "./Types";
import CommonTypes "../shared/CommonTypes";


module {

	public type DataStoreView = {
		buckets : [Text];
		active_bucket : Text;
		last_update : Time.Time;
	};	

	public type DataSectionView = {
		data_path : CommonTypes.ResourcePath;
		category : CommonTypes.CategoryId;
		data: [CommonTypes.ResourcePath];
	};

	public type DataGroupView = {
		// name for internal management.
		data_path : CommonTypes.ResourcePath;
		sections: [DataSectionView];
		readonly : ?Nat;
	};

	public type BundleView = {
		data_path : CommonTypes.ResourcePath;
		name : Text;
		description : Text;
		// simple light weigh logo
		logo : ?CommonTypes.ResourcePath;
		tags : [Text];
		creator : CommonTypes.Identity;
		owner : CommonTypes.Identity;
		created : Time.Time;
	};

    public func convert_bundle_view (info: Types.Bundle) : BundleView {
        return {
			data_path = info.data_path;
			name = info.name;
			description = info.description;
			logo = info.logo;
			tags = List.toArray (info.tags);
			creator = info.creator;
			owner = info.owner;
			created = info.created;
        };
    };	

    public func convert_datagroup_view (info: Types.DataGroup) : DataGroupView {
        return {
            data_path = info.data_path;
            sections = List.toArray(List.map(info.sections, func (s : Types.DataSection) : DataSectionView {
		    {
				data_path = s.data_path;
				category = s.category;
				data = List.toArray(s.data);
		    };
		    }));
			readonly = info.readonly;
        };
    };

    public func convert_datastore_view (info: Types.DataStore) : DataStoreView {
        return {
            buckets = List.toArray(info.buckets);
            active_bucket = Option.get(info.active_bucket,"");
			last_update = Option.get(info.last_update,0);
        };
    };		

	public func convert_to_blob (category: CommonTypes.CategoryId, args : CommonTypes.Serialization.StructureArgs) : Result.Result<Blob, CommonTypes.Errors> {
		let blob_to_save = switch (category) {
			case (#General) {
				switch (args.general) {
					case (?general) {
						switch (JSON.toText(to_candid(general), CommonTypes.Serialization.POI_GENERAL_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (e)) { return #err(#ActionFailed)};
						};
					};
					// save general data for POI
					// no data given
					case (null)  { return #err(#ActionFailed)};
				};
			};
			case (#About) {
				switch (args.about) {
					case (?about) {
						switch (JSON.toText(to_candid(about), CommonTypes.Serialization.POI_ABOUT_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (e)) { return #err(#ActionFailed)};
						};
					};
					// no data given
					case (null)  { return #err(#ActionFailed)};
				};
			};
			case (_)  { return #err(#NotSupported)};
		};
		#ok(blob_to_save);
	};

};
