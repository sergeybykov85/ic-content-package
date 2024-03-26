
import List "mo:base/List";
import Option "mo:base/Option";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Blob "mo:base/Blob";
import { JSON; Candid } "mo:serde";
import Result "mo:base/Result";
import Debug "mo:base/Debug";

import Types "./Types";
import CommonTypes "../shared/CommonTypes";


module {

	let LOCATION_FIELDS = ["latitude", "longitude", "country_code2", "region", "city", "coordinates"];
	let REFERENCE_FIELDS = ["title","url"];
	let HISTORY_FIELDS = ["date_from","date_to","period", "title", "body", "locale"];
	let ABOUT_FIELDS = ["name", "value", "attributes", "locale", "description"];
	// unfortunately,  serge lib can't serialize Float properly, better to save it as text
	public type LocationJson = {country_code2:Text; region:Text; city:Text; latitude : Text; longitude : Text};

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

	public type DataIndexView = {
		// only from POI
		location : ?CommonTypes.Location;
		// only from POI
		about : [CommonTypes.AboutData];
		tags : [Text];
		classification : Text;
	};

	public type DataGroupView = {
		// name for internal management.
		data_path : CommonTypes.ResourcePath;
		sections: [DataSectionView];
		readonly : ?Nat;
	};

	public type DataView = {
		// name for internal management.
		id : CommonTypes.DataGroupId;
		group : DataGroupView;
	};	

	public type BundleRefView = {
		id : Text;
		data_path : CommonTypes.ResourcePath;
		name : Text;
		// simple light weigh logo
		logo : ?CommonTypes.ResourcePath;
		tags : [Text];
		classification : Text;		
		creator : CommonTypes.Identity;
		owner : CommonTypes.Identity;
		created : Time.Time;
	};

	public type BundleDetailsView = {
		id : Text;
		data_path : CommonTypes.ResourcePath;
		name : Text;
		description : Text;
		logo : ?CommonTypes.ResourcePath;
		index : DataIndexView;
		creator : CommonTypes.Identity;
		owner : CommonTypes.Identity;
		created : Time.Time;
	};	

    public func convert_bundle_ref_view (info: Types.Bundle, id: Text) : BundleRefView {
        return {
			id = id;
			data_path = info.data_path;
			name = info.name;
			logo = info.logo;
			// in case of "ref" about and location is not propagated to reduce the traffic
			tags = List.toArray (info.index.tags);
			classification = info.index.classification;			
			creator = info.creator;
			owner = info.owner;
			created = info.created;
        };
    };

    public func convert_bundle_details_view (info: Types.Bundle, id: Text) : BundleDetailsView {
        return {
			id = id;
			data_path = info.data_path;
			name = info.name;
			description = info.description;
			logo = info.logo;
			index = {
				tags = List.toArray(info.index.tags);
				classification = info.index.classification;
				location = info.index.location;
				about = List.toArray(info.index.about);
			};
			creator = info.creator;
			owner = info.owner;
			created = info.created;
        };
    };		

    public func convert_datagroup_view (info: Types.DataGroup) : DataGroupView {
        _convert_datagroup_view(info);
    };

    public func convert_datastore_view (info: Types.DataStore) : DataStoreView {
        return {
            buckets = List.toArray(info.buckets);
            active_bucket = Option.get(info.active_bucket,"");
			last_update = Option.get(info.last_update,0);
        };
    };		

	public func convert_to_blob (category: CommonTypes.CategoryId, args : Types.DataDomainPayload) : Result.Result<Blob, CommonTypes.Errors> {
		let blob_to_save = switch (category) {
			case (#Location) {
				switch (args.location) {
					case (?location) {
						let lj:LocationJson = {
							country_code2 = location.country_code2;
							region = Option.get(location.region,"");
							city = Option.get(location.city,"");
							latitude = Float.toText(location.coordinates.latitude);
							longitude = Float.toText(location.coordinates.longitude);
						};
						switch (JSON.toText(to_candid(lj), LOCATION_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (_)) { return #err(#InvalidRequest)};
						};
					};
					case (null)  { return #err(#InvalidRequest)};
				};
			};
			case (#About) {
				switch (args.about) {
					case (?about) {
						switch (JSON.toText(to_candid(about), ABOUT_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (_)) { return #err(#InvalidRequest)};
						};
					};
					// no data given
					case (null)  { return #err(#InvalidRequest)};
				};
			};
			case (#History) {
				switch (args.history) {
					case (?history) {
						switch (JSON.toText(to_candid(history), HISTORY_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (_)) { return #err(#InvalidRequest)};
						};
					};
					// no data given
					case (null)  { return #err(#InvalidRequest)};
				};
			};			
			case (_) {
				switch (args.reference) {
					case (?reference) {
						switch (JSON.toText(to_candid(reference), REFERENCE_FIELDS, null)) {
							case (#ok(j)) {Text.encodeUtf8(j); };
							case (#err (_)) { return #err(#InvalidRequest)};
						};
					};
					case (null)  { return #err(#InvalidRequest)};
				};
			};	
		};
		#ok(blob_to_save);
	};

	public func to_metadata (args : ?Types.MetadataArgs) : Types.Metadata {
		switch (args) {
			case (?m) {
				{
				var name = m.name;
				var description = m.description;
				var logo = m.logo;
				}
			};
			case (null) {{var name = ""; var description = ""; var logo = null}};
		}
	};

	public func to_contributors (package_type:Types.Submission, contributors : ?[CommonTypes.Identity]) : List.List<CommonTypes.Identity> {
		switch (package_type) {
			case (#Shared) {
				switch (contributors) {
					case (?con) {List.fromArray(con)};
					case (null) {List.nil()};
				}
			};
			case (_) {List.nil()};
		};
	};


    private func _convert_datagroup_view (info: Types.DataGroup) : DataGroupView {
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

};
