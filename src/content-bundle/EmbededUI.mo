
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import List "mo:base/List";
import Option "mo:base/Option";
import Principal "mo:base/Principal";

import Http "../shared/Http";
import CommonUtils "../shared/CommonUtils";
import CommonTypes "../shared/CommonTypes";

import Types "./Types";
import Utils "./Utils";


module {

    public let FORMAT_DATES_SCRIPT = "<script>let dates = document.getElementsByClassName(\"js_date\"); for (let i=0; i<dates.length; i++) { dates[i].innerHTML = (new Date(dates[i].textContent/1000000).toLocaleString()); } </script>";    

    let GLOBAL_CSS =  "<style type=\"text/css\"> a { text-decoration: underscore; color:#090909; } body { background-color: #F7F7F7; color:#090909; font-family: helvetica; padding: 5px; } </style>";
	let CLASS_CSS =  "<style type=\"text/css\"> .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; } .details { max-width:1100px; } .logo { max-height:200px; margin: 1em auto; display:block; } .logo_details { max-height:300px; margin: 1em auto; display:block; } .cell { min-height: 100px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } .cell_details { min-height: 250px; border: 1px solid gray; border-radius: 8px; padding: 8px 8px; position: relative; } .tag { color:#1414A8; margin: 0 4px; border: 1px solid #2C44DA; border-radius: 8px; padding: 4px 10px; background-color:#B6E3FF;} .right {float:right;}</style>";

    public func render_root_header (tags:?[Text], total:Nat) : Text {
        var out_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS# "</head><body>" # "<h2>&#128464; Content bundles overview &#9757; </h2><span><i>Total bundles</i> : <span style=\"padding: 0 20 0 5; font-weight:bold;\">"# Nat.toText(total) # "</span><hr/>";
		switch (tags) {
            case (?t_list) {
				var tag_out = "";
				if (Array.size(t_list) > 0) {
					tag_out := tag_out # "<div style=\"margin: 20px 0px;\">";
					for (tag in t_list.vals()) {
						tag_out := tag_out # "<span class=\"tag\">"#tag#"</span>";
					};
					tag_out := tag_out #  "</div>";
				};
				out_html:=out_html # tag_out;
			};
            case (null) {};
        };
        out_html;
    };

    public func bundle_page_response(canister_id:Text, network:CommonTypes.Network, key : Text, target_bundle:?Types.Bundle) : Http.Response {
		switch (target_bundle) {
            case (null) { Http.not_found() };
            case (? v)  {
				///
				let root_url = Utils.build_resource_url({resource_id = ""; canister_id = canister_id; network = network; view_mode = #Index; route = null;});
				var directory_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS#"</head><body>" # "<h2><span><a style=\"margin: 0 5px;\" href=\"" # root_url # "\" >"#Utils.ROOT#"</a></span>  &#128464; Content bundle : "#v.name#" </h2><hr/><div class=\"details\">";
				
				directory_html:=directory_html # render_bundle_details(canister_id, network, key, v);
				// extra details possible here
				return Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(directory_html #FORMAT_DATES_SCRIPT#"</body></html>"));
			};
        };
    };

	public func render_bundle_overview (canister_id: Text, network:CommonTypes.Network, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#2C44DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (CommonUtils.unwrap(r.logo)).url # "\" class=\"logo\">";
		};

		resource_html := resource_html # "<p><u>Created</u> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><u>Creator</u> : "# debug_show(r.creator) # "</p>";

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};


	public func render_bundle_details (canister_id: Text, network:CommonTypes.Network, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell_details\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#2C44DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		resource_html := resource_html # "<p><i>"# r.description # "</i></p>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (CommonUtils.unwrap(r.logo)).url # "\" class=\"logo_details\">";
		};
		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<p>"# tags_fmt # "</p>";
		};	
		resource_html := resource_html # "<div style=\"padding: 4px 3px;\"><b>ID</b> : <span class=\"right\">"# debug_show(id) # "</span></div>";
		resource_html := resource_html # "<div style=\"padding: 4px 3px;\"><b>Root data path</b> : <span class=\"right\"><a  href=\"" # r.data_path.url #"\" target = \"_blank\">"#r.data_path.url#"</a></span></div>";
		resource_html := resource_html # "<div style=\"padding: 4px 3px;\"><b>Created</b> : <span class=\"right\"><span class=\"js_date\">"# Int.toText(r.created) # "</span></span></div>";
		resource_html := resource_html # "<div style=\"padding: 4px 3px;\"><b>Creator</b> : <span class=\"right\">"# debug_show(r.creator) # "</span></div>";
		resource_html := resource_html # "<div style=\"padding: 4px 3px;\"><b>Owner</b> : <span class=\"right\">"# debug_show(r.owner) # "</span></div>";		
		
		switch (r.payload.poi_group) {
			case (?poi) {
				resource_html := resource_html # "<hr><p><b>'POI' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 3px 12px;\">created : <span class=\"right\"><span class=\"js_date\">"# Int.toText(poi.created) # "</span></span></div>";
				resource_html := resource_html # "<div style=\"padding: 3px 12px;\">path : <span class=\"right\"><a  href=\"" # poi.data_path.url #"\" target = \"_blank\">"#poi.data_path.url#"</a></span></div>";
				if (Utils.is_readonly(poi)) {
					resource_html := resource_html # "<div style=\"padding: 3px 12px;\">&#128274; readonly untill : <span class=\"right\"><span class=\"js_date\">"# Int.toText(CommonUtils.unwrap(poi.readonly)) # "</span></span></div>";
				};
				// render index
				switch (r.index.poi) {
					case (?index) {
						switch (index.location) {
							case (?location) { resource_html := resource_html # "<div style=\"padding: 3px 12px;\">country | region | city | (latitude, longitude) : <span class=\"right\">"# location.country_code2 # " | "# (Option.get(location.region, "--/--")) # " | " #  (Option.get(location.city, "--/--")) # " ("# Float.toText(location.coordinates.latitude) # ", "# Float.toText(location.coordinates.longitude) #")</span></div>"; };
							case (null) {};
						};
					};
					case (null) {};
				};
				// render sections
				if (not List.isNil(poi.sections)){
					resource_html := resource_html # "<div style=\"padding: 2px 12px;\">sections :";
					for (section in List.toIter(poi.sections)) {
						resource_html := resource_html # "<span class=\"right\"><span style=\"padding: 0 12px;\"><i><a  href=\"" # section.data_path.url #"\" target = \"_blank\">"#debug_show(section.category)#"</a></i></span></span>";
					};
					resource_html := resource_html # "</div>";	
				};					
			};
			case (null) {resource_html := resource_html # "<hr><p><b>'POI' data group</b> : --- / --- </p>";}
		};

		switch (r.payload.additions_group) {
			case (?add) {
				resource_html := resource_html # "<hr><p><b>'Additions' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 2px 12px;\">created : <span class=\"right\"><span class=\"js_date\">"# Int.toText(add.created) # "</span></span></div>";
				resource_html := resource_html # "<div style=\"padding: 2px 12px;\">path : <span class=\"right\"><a  href=\"" # add.data_path.url #"\" target = \"_blank\">"#add.data_path.url#"</a></span></div>";
				if (Utils.is_readonly(add)) {
					resource_html := resource_html # "<div style=\"padding: 2px 12px;\">readonly untill : <span class=\"right\"><span class=\"js_date\">"# Int.toText(CommonUtils.unwrap(add.readonly)) # "</span></span></div>";
				};
				// render sections
				if (not List.isNil(add.sections)){
					resource_html := resource_html # "<div style=\"padding: 2px 12px;\">sections :";
					for (section in List.toIter(add.sections)) {
						resource_html := resource_html # "<span class=\"right\"><span style=\"padding: 0 12px;\"><i><a  href=\"" # section.data_path.url #"\" target = \"_blank\">"#debug_show(section.category)#"</a></i></span></span>";
					};
					resource_html := resource_html # "</div>";	
				};			
			};
			case (null) {resource_html := resource_html # "<hr><p><b>'Additions' data group</b> : --- / --- </p>";}
		};

		
		return  resource_html # "</div>";	
	};

};
