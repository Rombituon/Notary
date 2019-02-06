// Copyright (c) 2019, Eng. Bilal Ghayad and contributors
// For license information, please see license.txt

cur_frm.add_fetch('customer', 'customer_name', 'customer_name')
cur_frm.add_fetch('customer', 'customer_classification', 'customer_classification')
cur_frm.add_fetch('item_code', 'application_name', 'item_name')
cur_frm.add_fetch('fees', 'fees_name', 'fees_name')
cur_frm.add_fetch('fees', 'fees_type', 'fees_type')


var notary_fees_query;
var notary_fees_table;
frappe.ui.form.on('Notary Sales Invoice', {

	setup: function(frm) {

		frm.set_value('discount_percent_event', 0);
		frm.set_value('discount_amount_event', 0);
	},

	refresh: function(frm) {
		if(frm.doc.docstatus===1) {
			frm.add_custom_button(__('Accounting Ledger'), function() {
				frappe.route_options = {
					voucher_no: frm.doc.name,
					from_date: frm.doc.posting_date,
					to_date: frm.doc.posting_date,
					company: frm.doc.company,
					group_by_voucher: false
				};
				frappe.set_route("query-report", "General Ledger");
			}, __("View"));

			frm.add_custom_button(__("Show Payments"), function() {
				frappe.set_route("List", "Payment Entry", {"Payment Entry Reference.reference_name": frm.doc.name});
			}, __("View"));

			frm.add_custom_button(__('Payment'), function() { frm.events.make_payment_entry(frm); }, __("Make"));
			cur_frm.page.set_inner_btn_group_as_primary(__("Make"));
		};

		frappe.call({
			method: "notary.notary.doctype.notary_sales_invoice.notary_sales_invoice.get_notary_fees",
			callback: function(r) {
//				msgprint("Welcome");
				notary_fees_query = r.message;
				notary_fees_table = notary_fees_query;
//				msgprint(notary_fees_query);
//				msgprint(notary_fees_query[0]['name']);
			}
		});
	},
	onload: function(frm) {

		frappe.call({
			method: "notary.notary.doctype.notary_sales_invoice.notary_sales_invoice.get_company_accounts",
			args: {
				company: frm.doc.company
			},
			callback: function(r) {
				if (r.message) {
					cur_frm.set_value("receivable_account", r.message[0][0]['default_receivable_account']);
					cur_frm.set_value("income_account", r.message[1]);
					cur_frm.set_value("cash_account", r.message[0][0]['default_cash_account']);
					cur_frm.set_value("cost_center", r.message[0][0]['cost_center']);
				}
				else {
					frappe.msgprint(__("There are not a default accounts in the Company {0}, please select the Accounts", [frm.doc.company]));
				}
			}
		});

		frm.set_query('customer', function(doc) {
			return {
				query: "erpnext.controllers.queries.customer_query"
			};
		});

		frm.set_query("address_title", function(doc) {
			return {
				query: 'frappe.contacts.doctype.address.address.address_query',
				filters: {
					link_doctype: 'Customer',
					link_name: frm.doc.customer
				}
			}
		});

//		frm.set_value('customer_currency', 'USD');
//		frm.set_value('supplier_currency', 'USD');
//		frm.set_value('fare_tax_currency', 'USD');

	},

	customer: function(frm) {
                //msgprint ("Welcome");

		if (frm.doc.customer) {

			frappe.call({
				method: "notary.notary.doctype.notary_sales_invoice.notary_sales_invoice.get_customer_currency",
				args: {customer: frm.doc.customer},
				callback: function(r) {
					//msgprint(r.message);

					if (r.message) {
						frm.set_value('customer_currency', r.message);
					}
					else {
						frm.set_value('customer_currency', 'USD');
					}
					refresh_field('customer_currency');
				}
			});
		}
	},
	customer_currency: function(frm) {
		var company_currency = frappe.model.get_value('Company', frm.doc.company, 'default_currency');
//              frappe.msgprint(__("Company {0} Currency is {1}", [frm.doc.company, company_currency]));
		if (company_currency != frm.doc.customer_currency) {
			frappe.call({
				method: "notary.notary.doctype.notary_sales_invoice.notary_sales_invoice.get_currency_rate",
				args: {
					currency: frm.doc.customer_currency,
					invoice_date: frm.doc.posting_date
				},
				callback: function(r) {
					if (r.message) {
						cur_frm.set_value("currency_conversion", r.message);
						refresh_field('currency_conversion');
					}
					else {
						cur_frm.set_value("currency_conversion", 0.0);
						refresh_field('currency_conversion');
						frappe.msgprint(__("There is no rate conversion for currency {0}", [frm.doc.customer_currency]));
					}
				}
			});
		}
		else {
			cur_frm.set_value("currency_conversion", 1.0);
			refresh_field('currency_conversion');
		}

		frappe.call({
			method: "erpnext.accounts.utils.get_balance_on",
			args: {date: frm.doc.posting_date, party_type: 'Customer', party: frm.doc.customer},
			callback: function(r) {
				//msgprint(r.message);
				if (flt(r.message) == 0) {
					frm.set_value("customer_balance", "0.00");
				}
				else {
					frm.set_value("customer_balance", flt(r.message)/(frm.doc.currency_conversion));
				}
				refresh_field('customer_balance');
			}
		});
	},


	total_items_cur1: function(frm) {
		frm.set_value("total_amount", frm.doc.total_items_cur1);
		frm.set_value("grand_total", flt(frm.doc.total_amount) - flt(frm.doc.discount_amount));
		refresh_field('total_amount');
		refresh_field('grand_total');
	},


	grand_total: function(frm) {
		frm.set_value("outstanding_amount", flt(frm.doc.grand_total) - flt(frm.doc.total_paid_amount));
		refresh_field('outstanding_amount');
	},

	total_paid_amount: function(frm) {
		frm.set_value("outstanding_amount", flt(frm.doc.grand_total) - flt(frm.doc.total_paid_amount));
		refresh_field('outstanding_amount');
	},

	discount_percent: function(frm) {
		if (frm.doc.discount_amount_event == 1) {
			frm.set_value('discount_amount_event', 0);
			frm.set_value('discount_percent_event', 0);
		}
		else {
			frm.set_value('discount_percent_event', 1);
			frm.set_value('discount_amount', flt(frm.doc.total_amount) * frm.doc.discount_percent/100);
			frm.set_value('grand_total', flt(frm.doc.total_amount) - flt(frm.doc.discount_amount));
//			frm.set_value('outstanding_amount', frm.doc.credit_amount);
		}
	},

	discount_amount: function(frm) {
		if (frm.doc.discount_percent_event == 1) {
			frm.set_value('discount_percent_event', 0);
			frm.set_value('discount_amount_event', 0);
		}
		else {
			frm.set_value('discount_amount_event', 1);
			frm.set_value('grand_total', flt(frm.doc.total_amount) - flt(frm.doc.discount_amount));
			frm.set_value('discount_percent', flt(frm.doc.discount_amount) * 100 / flt(frm.doc.total_amount));
//			frm.set_value('outstanding_amount', frm.doc.credit_amount);
		}
	},

	make_payment_entry: function(frm) {
		var method = "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry";
		return frappe.call({
			method: method,
			args: {
				"dt": frm.doc.doctype,
				"dn": frm.doc.name
			},
			callback: function(r) {
				var doclist = frappe.model.sync(r.message);
				frappe.set_route("Form", doclist[0].doctype, doclist[0].name);
			}
		});
	}
});

frappe.ui.form.on('Notary Sales Invoice Items', {
	item_code: function(frm, cdt, cdn) {

	        var item = locals[cdt][cdn];
		if (item.item_code) {
			get_notary_item_details(frm, cdt, cdn);
		}
	},


	items_remove: function(frm, cdt, cdn) {

		items_calculation(frm,cdt,cdn);
	},

	total_fees: function(frm, cdt, cdn) {
		
	        var item = locals[cdt][cdn];
		if (item.charge_fees == "") {
			item.item_price = flt(item.total_fees);
			refresh_field("items");
			items_calculation(frm,cdt,cdn);
		}
		else {
			item.item_price = flt(item.total_fees) + flt(item.charge_fees);
			refresh_field("items");
			items_calculation(frm,cdt,cdn);
		}
	},

	charge_fees: function(frm, cdt, cdn) {

	        var item = locals[cdt][cdn];
		items_calculation(frm,cdt,cdn);
	
		item.item_price = flt(item.total_fees) + flt(item.charge_fees);

/* refresh_field is required before calling items_calculation or frm.doc.items[(item.idx) - 1].item_price need to be used. But refresh_field is required to 
display the field value itself


		frm.doc.items[(item.idx) - 1].item_price = flt(item.total_fees) + flt(item.charge_fees);
*/

		refresh_field("items");
		items_calculation(frm,cdt,cdn);

//		frm.set_value("total_items_cur1", flt(frm.doc.total_items_cur1) + flt(item.item_price));

//		refresh_field("items");
	},

	item_price: function(frm, cdt, cdn) {

	        var item = locals[cdt][cdn];
		items_calculation(frm,cdt,cdn);
	}

});

var get_notary_item_details = function(frm, cdt, cdn) {

        var item = locals[cdt][cdn];
	frm.set_value('discount_percent_event', 0);
	frm.set_value('discount_amount_event', 0);
	frappe.call({
		method: "notary.notary.doctype.notary_sales_invoice.notary_sales_invoice.get_item_details",
		args: {
			item_code: item.item_code
		},
		callback: function(r) {
			var fees_code, fees_name, fees_price, fees_account;
			var fees_name;
			var total_fees = 0;
        		var item = locals[cdt][cdn];
//			frm.doc.items[(item.idx) - 1].fees_quantity = r.message.length;
			item['fees_quantity'] =  r.message.length;
			$.each(r.message, function(i, row)
			{
				fees_code = "fees"+(i+1)+"_code";
				fees_name = "fees"+(i+1)+"_name";
				fees_price = "fees"+(i+1)+"_price";
				fees_account = "fees"+(i+1)+"_account";
				item[fees_code] = row.fees_code;
				item[fees_name] = row.fees_name;
				item[fees_price] = row.price;
				item[fees_account] = row.notary_fees_account;
				total_fees = total_fees + flt(row.price);
			});

			frm.set_value("total_items_cur1", flt(frm.doc.total_items_cur1) - flt(item.item_price));
			item.total_fees = total_fees;
			item.item_price = total_fees + flt(item.charge_fees);
			refresh_field("items");
			frm.set_value("total_items_cur1", flt(frm.doc.total_items_cur1) + flt(item.item_price));
			refresh_field('section_break_17');
			refresh_field('total_items_cur1');
			refresh_field("items");
//			frm.refresh();
			items_calculation(frm,cdt,cdn);
		}
	});
}

var items_calculation = function(frm, cdt, cdn) {

	var total_price = 0;
	var fees_code;
	var fees_price;
        var new_row;
        var total_fees = 0;
        cur_frm.clear_table("fees");

	$.each(notary_fees_table, function(i, row) {
		if (row.amount != 0) {
			row.amount = 0;
		}
	});

	$.each(frm.doc.items, function(i, row) {
		total_price = total_price + flt(row.item_price);

	//	frappe.msgprint(__("Before entering notary fees, Row number {0}", [i]));

		for (j=0; j< row.fees_quantity; j++) {

			fees_code = "fees"+(j+1)+"_code";
			fees_price = "fees"+(j+1)+"_price";

			$.each(notary_fees_table, function(k, row2) {
				if (row2.name === row[fees_code]) {
					notary_fees_table[k]['amount'] = flt(notary_fees_table[k]['amount']) + flt(row[fees_price]);
					return false;
				}
			});
		}

	});
	frm.set_value("total_items_cur1", total_price);
	refresh_field('section_break_17');
	refresh_field('total_items_cur1');

	$.each(notary_fees_table, function(i, row) {
//              frappe.msgprint(__("Welcome: {0}", [row.name]));
		if (row.amount != 0)
		{
			new_row = frappe.model.add_child(cur_frm.doc, "Notary Sales Invoice Fees", "fees");
			new_row.fees = row.name;
			new_row.fees_name = row.fees_name;
			new_row.fees_type = row.fees_type;
			new_row.amount = row.amount;
		}

	});

	refresh_field('fees');


	$.each(frm.doc.fees, function(i, row) {
		total_fees = total_fees + row.amount;
	});


	frm.set_value("total_fees_cur1", total_fees);
	refresh_field('section_break_21');
	refresh_field('total_fees_cur1');
//	frm.refresh();
/*
	$.each(notary_fees_table, function(k, row2) {
		if (row2.amount != 0) {
			frappe.msgprint(__("notary_fees_table[k]['name'] is {0}", [notary_fees_table[k]['name']]));
			frappe.msgprint(__("notary_fees_table[k]['amount'] is {0}", [notary_fees_table[k]['amount']]));
		}
	});
*/
}
