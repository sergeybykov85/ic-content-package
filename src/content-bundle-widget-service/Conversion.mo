
import Text "mo:base/Text";
import Time "mo:base/Time";
import Blob "mo:base/Blob";

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
