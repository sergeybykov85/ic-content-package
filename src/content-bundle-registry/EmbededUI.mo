
import Int "mo:base/Int";
import Float "mo:base/Float";
import Iter "mo:base/Iter";
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

    let GLOBAL_CSS =  "<style type=\"text/css\"> a { text-decoration: underscore; color:#090909; } body { background-color: #F7F7F7; color:#090909; font-family: helvetica; } </style>";
	let CLASS_CSS =  "<style type=\"text/css\"> .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; } .details { max-width:900px; } .logo { max-height:200px; margin: 1em auto; display:block; } .logo_details { max-height:300px; margin: 1em auto; display:block; } .cell { min-height: 100px; border: 1px solid gray; border-radius: 8px; padding: 8px 16px; position: relative; } .cell_details { min-height: 250px; border: 1px solid gray; border-radius: 8px; padding: 8px 8px; position: relative; } .tag { color:#1414A8; margin: 0 4px; border: 1px solid #2C44DA; border-radius: 8px; padding: 4px 16px; background-color:#B6E3FF;} .right {float:right;}</style>";

    public func render_root_header (tag:?Text) : Text {
        var out_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS# "</head><body>" # "<h2>&#128464; Overview &#9757; </h2><hr/>";
		switch (tag) {
            case (?t) {out_html:=out_html # "<h3>Packages <span class=\"tag\">" # t # "</span></h3><div class=\"grid\">";};
            case (null) {out_html := out_html # "<h3>Packages</h3><div class=\"grid\">";};
        };
        out_html;
    };

    public func page_response(canister_id:Text, network:CommonTypes.Network, key : Text, target_package:?Types.BundlePackage) : Http.Response {
		switch (target_package) {
            case (null) { Http.not_found() };
            case (? v)  {
				///
				let root_url = Utils.build_resource_url({resource_id = ""; canister_id = canister_id; network = network; view_mode = #Index; route = null;});
				var directory_html = "<html><head>"#GLOBAL_CSS#CLASS_CSS#"</head><body>" # "<h2><span><a style=\"margin: 0 5px;\" href=\"" # root_url # "\" >"#Utils.ROOT#"</a></span>  &#128464; "#v.name#" </h2><hr/><div class=\"details\">";
				
				directory_html:=directory_html # render_details(canister_id, network, key, v);
				// extra details possible here
				return Http.success([("content-type", "text/html; charset=UTF-8")], Text.encodeUtf8(directory_html #FORMAT_DATES_SCRIPT#"</body></html>"));
			};
        };
    };

	public func render_overview (canister_id: Text, network:CommonTypes.Network, id:Text, r:Types.BundlePackage) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#2C44DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		if (Option.isSome(r.logo_url)) {
			resource_html := resource_html # "<img  src=\"" # CommonUtils.unwrap(r.logo_url) # "\" class=\"logo\">";
		};

		resource_html := resource_html # "<p><u>Created</u> : <span class=\"js_date\">"# Int.toText(r.created) # "</span><span class=\"right\"><span class=\"tag\">"#Utils.resolve_submission_name(r.submission)#"</span></span></p>";
		resource_html := resource_html # "<p><u>Creator</u> : "# debug_show(r.creator) # "</p>";
		resource_html := resource_html # "<p><u>Submitter</u> : "# debug_show(r.submitter) # "</p>";

		return  resource_html # "</div>";	
	};


	public func render_details (canister_id: Text, network:CommonTypes.Network, id:Text, r:Types.BundlePackage) : Text {
		let url = Utils.build_resource_url({resource_id = id; canister_id = canister_id; network = network; view_mode = #Index; route = null});
		var resource_html = "<div class=\"cell_details\">";
		resource_html :=resource_html # "<div>&#128464; <a style=\"font-weight:bold; color:#2C44DA;\" href=\"" # url # "\" target = \"_self\">"# r.name # "</a></div>";
		resource_html := resource_html # "<p><i>"# r.description # "</i></p>";
		if (Option.isSome(r.logo_url)) {
			resource_html := resource_html # "<img  src=\"" # CommonUtils.unwrap(r.logo_url) # "\" class=\"logo_details\">";
		};

		let package_url = Utils.build_resource_url({resource_id = ""; canister_id = id; network = network; view_mode = #Index});

		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>ID</b> : <span class=\"right\"><a  href=\"" # package_url #"\" target = \"_blank\">"#id#"</a></span></div>";
		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>Submission type</b> : <span class=\"right\"><span class=\"tag\">"#Utils.resolve_submission_name(r.submission)#"</span></span></div>";
		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>Created</b> : <span class=\"right\"><span class=\"js_date\">"# Int.toText(r.created) # "</span></span></div>";
		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>Creator</b> : <span class=\"right\">"# debug_show(r.creator) # "</span></div>";
		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>Registered</b> : <span class=\"right\"><span class=\"js_date\">"# Int.toText(r.registered) # "</span></span></div>";
		resource_html := resource_html # "<div style=\"padding: 8px 4px;\"><b>Submitter</b> : <span class=\"right\">"# debug_show(r.submitter) # "</span></div>";
		
		return  resource_html # "</div>";	
	};

};
