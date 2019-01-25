frappe.listview_settings['Notary Sales Invoice'] = {
	add_fields: ["grand_total_amount_inwords", "outstanding_amount", "due_date"],
	get_indicator: function(doc) {
		if(flt(doc.outstanding_amount)===0) {
			return [__("Paid"), "green", "outstanding_amount,=,0"];
		} else if (flt(doc.outstanding_amount) > 0 && doc.due_date > frappe.datetime.get_today()) {
			return [__("Unpaid"), "orange", "outstanding_amount,>,0|due_date,>,Today"];
		}
		else if (flt(doc.outstanding_amount) > 0 && doc.due_date <= frappe.datetime.get_today()) {
			return [__("Overdue"), "red", "outstanding_amount,>,0|due_date,<=,Today"];
		}
	}
};
