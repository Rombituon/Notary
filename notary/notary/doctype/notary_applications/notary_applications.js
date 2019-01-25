// Copyright (c) 2019, Eng. Bilal Ghayad and contributors
// For license information, please see license.txt

cur_frm.add_fetch('fees_code', 'fees_name', 'fees_name')
cur_frm.add_fetch('fees_code', 'notary_fees_account', 'notary_fees_account')
cur_frm.add_fetch('fees_code', 'fees_type', 'fees_type')

frappe.ui.form.on('Notary Applications', {
	refresh: function(frm) {

	}
});
