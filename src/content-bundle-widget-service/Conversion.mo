
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";

import Types "./Types";
import CommonTypes "../shared/CommonTypes";


module {

	public type CriteriaView = {
		entity : ?Types.IdsRef;
		by_country_code : ?Text;
		by_tag : ?Text;
		by_classification : ?Text;
	};

	public type OptionsView = {
		width : ?Nat8;
		height : ?Nat8;
		// other fields that impact to UI style could be placed here
	};

	public type WidgetView = {
		id : Text;
		name : Text;
		description : Text;
		type_id : Types.TypeId;
		status : Types.Status;
		criteria : ?CriteriaView;
		options : ?OptionsView;
		creator : CommonTypes.Identity;
		created : Time.Time;
	};


	public type WidgetItemView = {
		package_id : Text;
		bundle : {
			id : Text;
			data_path : CommonTypes.ResourcePath;
			name : Text;
			description : Text;
			logo : ?CommonTypes.ResourcePath;
			index : Types.Actor.DataIndexView;
			payload_items : [CommonTypes.DataPayloadStructure];
			creator : CommonTypes.Identity;
			owner : CommonTypes.Identity;
			created : Time.Time;
		}
	};	

    public func convert_bundle_item (info: Types.Actor.BundleDetailsView, package_id: Text) : WidgetItemView {
		return {
			package_id  = package_id;
			bundle = {
				id = info.id;
				data_path = info.data_path;
				name = info.name;
				description = info.description;
				logo = info.logo;
				index = info.index;
				payload_items = info.payload_items;
				creator = info.creator;
				owner = info.owner;
				created = info.created;
			};
        };
    };

    public func convert_bundle_items (items: [Types.Actor.BundleDetailsView], package_id: Text) : [WidgetItemView] {
		let res = Buffer.Buffer<WidgetItemView>(Array.size(items));
		for (item in items.vals()) {
			res.add(convert_bundle_item(item, package_id))
		};
		Buffer.toArray(res);
    };	

	public func convert_widget_view (info: Types.Widget, id:Text) : WidgetView {
		let cr:?CriteriaView = switch (info.criteria) {
			case (?criteria) {
				?{
					entity = criteria.entity;
					by_country_code = criteria.by_country_code;
					by_tag = criteria.by_tag;
					by_classification = criteria.by_classification;
				};
			};
			case (null) {null;};
		};
		let opt:?OptionsView = switch (info.options) {
			case (?options) {
				? {
					width = options.width;
					height = options.height;
				};
			};
			case (null) {null;};

		};
        return {
			id = id;
			name = info.name;
			description = info.description;
			criteria = cr;
			options = opt;
			type_id = info.type_id;
			status = info.status;
			creator = info.creator;
			created = info.created;
        };
    };		

};
