
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import List "mo:base/List";
import Option "mo:base/Option";
import Principal "mo:base/Principal";

import Http "../shared/Http";

import Types "./Types";
import Utils "./Utils";

module {

    public let FORMAT_DATES_SCRIPT = "<script>let dates = document.getElementsByClassName(\"js_date\"); for (let i=0; i<dates.length; i++) { dates[i].innerHTML = (new Date(dates[i].textContent/1000000).toLocaleString()); } </script>";    

    let GLOBAL_CSS =  "<style type=\"text/css\"> a { text-decoration: underscore; color:#090909; } body { background-color: #FFFDE7; color:#090909; font-family: helvetica; } </style>";
	let CLASS_CSS =  "<style type=\"text/css\"> .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; } .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; } .grid_details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; } .logo { max-height:200px; margin: 1em auto; display:block; } .logo_details { max-height:300px; margin: 1em auto; display:block; } .cell { min-height: 100px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } .cell_details { min-height: 250px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } .tag { color:#0969DA; margin: 0 4px; border: 1px solid #0969DA; border-radius: 8px; padding: 4px 10px; background-color:#B6E3FF;}</style>";

    public func render_root_header (tag:?Text) : Text {
        var out_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS# "</head><body>" # "<h2>&#128464; Overview &#9757; </h2><hr/>";
		switch (tag) {
            case (?t) {out_html:=out_html # "<h3>Bundles <span class=\"tag\">" # t # "</span></h3><div class=\"grid\">";};
            case (null) {out_html := out_html # "<h3>Bundles</h3><div class=\"grid\">";};
        };
        out_html;
    };

    public func bundle_page_response(canister_id:Text, network:Types.Network, key : Text, target_bundle:?Types.Bundle) : Http.Response {
		switch (target_bundle) {
            case (null) { Http.not_found() };
            case (? v)  {
				///
				let root_url = Utils.build_resource_url({resource_id = ""; canister_id = canister_id; network = network; view_mode = #Index; route = null;});
				var directory_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS#"</head><body>" # "<h2><span><a style=\"margin: 0 5px;\" href=\"" # root_url # "\" >"#Utils.ROOT#"</a></span>  &#128464; "#v.name#" </h2><hr/><div class=\"grid_details\">";
				
				directory_html:=directory_html # render_bundle_details(canister_id, network, key, v);
				// extra details possible here
				return Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(directory_html #FORMAT_DATES_SCRIPT#"</body></html>"));
			};
        };
    };


	public func render_bundle_overview (canister_id: Text, network:Types.Network, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#0969DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (Utils.unwrap(r.logo)).url # "\" class=\"logo\">";
		};

		resource_html := resource_html # "<p><u>Created</u> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><u>Creaator</u> : "# debug_show(r.creator) # "</p>";
		resource_html := resource_html # "<p><u>Owner</u> : "# debug_show(r.owner) # "</p>";

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};


	public func render_bundle_details (canister_id: Text, network:Types.Network, id:Text, r:Types.Bundle) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell_details\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#0969DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		resource_html := resource_html # "<p><i>"# r.description # "</i></p>";
		if (Option.isSome(r.logo)) {
			resource_html := resource_html # "<img  src=\"" # (Utils.unwrap(r.logo)).url # "\" class=\"logo_details\">";
		};
		resource_html := resource_html # "<p><b>ID</b> : "# debug_show(id) # "</p>";
		resource_html := resource_html # "<p><b>Root data path</b> : <a  href=\"" # r.data_path.url #"\" target = \"_blank\">"#r.data_path.url#"</a></p>";
		resource_html := resource_html # "<p><b>Created</b> : <span class=\"js_date\">"# Int.toText(r.created) # "</span></p>";
		resource_html := resource_html # "<p><b>Creaator</b> : "# debug_show(r.creator) # "</p>";
		resource_html := resource_html # "<p><b>Owner</b> : "# debug_show(r.owner) # "</p>";		
		
		switch (r.payload.poi_group) {
			case (?poi) {
				resource_html := resource_html # "<hr><p><b>'POI' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 4px 12px;\">created : <span class=\"js_date\">"# Int.toText(poi.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 4px 12px;\">path : <a  href=\"" # poi.data_path.url #"\" target = \"_blank\">"#poi.data_path.url#"</a></div>";
				if (Utils.is_readonly(poi)) {
					resource_html := resource_html # "<div style=\"padding: 4px 12px;\">&#128274; read only untill : <span class=\"js_date\">"# Int.toText(Utils.unwrap(poi.readonly)) # "</span></div>";
				};
				// render sections
				if (not List.isNil(poi.sections)){
					resource_html := resource_html # "<div style=\"padding: 4px 12px;\">sections :";
					for (section in List.toIter(poi.sections)) {
						resource_html := resource_html # "<span style=\"padding: 0 12px;\"><i><a  href=\"" # section.data_path.url #"\" target = \"_blank\">"#debug_show(section.category)#"</a></i></span>";
					};
					resource_html := resource_html # "</div>";	
				};					
			};
			case (null) {resource_html := resource_html # "<p><b>'POI' data group</b> : --- / --- </p>";}
		};

		switch (r.payload.additions_group) {
			case (?add) {
				resource_html := resource_html # "<hr><p><b>'Additions' data group</b></p>";
				resource_html := resource_html # "<div style=\"padding: 4px 12px;\">created : <span class=\"js_date\">"# Int.toText(add.created) # "</span></div>";
				resource_html := resource_html # "<div style=\"padding: 4px 12px;\">path : <a  href=\"" # add.data_path.url #"\" target = \"_blank\">"#add.data_path.url#"</a></div>";
				if (Utils.is_readonly(add)) {
					resource_html := resource_html # "<div style=\"padding: 4px 12px;\">read only untill : <span class=\"js_date\">"# Int.toText(Utils.unwrap(add.readonly)) # "</span></div>";
				};
				// render sections
				if (not List.isNil(add.sections)){
					resource_html := resource_html # "<div style=\"padding: 4px 12px;\">sections :";
					for (section in List.toIter(add.sections)) {
						resource_html := resource_html # "<span style=\"padding: 0 12px;\"><i><a  href=\"" # section.data_path.url #"\" target = \"_blank\">"#debug_show(section.category)#"</a></i></span>";
					};
					resource_html := resource_html # "</div>";	
				};			
			};
			case (null) {resource_html := resource_html # "<p><b>'Additions' data group</b> : --- / --- </p>";}
		};

		if (List.size(r.tags) > 0) {
			let tags_fmt = Text.join("", List.toIter(List.map(r.tags, func (t : Text):Text {"<span class=\"tag\">"#t#"</span>";})));
			resource_html := resource_html # "<hr><p>"# tags_fmt # "</p>";
		};		
		
		return  resource_html # "</div>";	
	};

};
