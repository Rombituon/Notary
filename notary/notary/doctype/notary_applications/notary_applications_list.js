frappe.listview_settings['Notary Applications'] = {
        add_fields: ["application_name", "disable", "image"],
	get_indicator: function(doc) {
                if(flt(doc.disable)===0) {
                        return [__("Enabled"), "blue", "disable,=,0"];
                } 
		else {
                        return [__("Disabled"), "grey", "disable,=,0"];
                }
        }
};
