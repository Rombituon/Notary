from __future__ import unicode_literals
from frappe import _

def get_data():
        return [
                {
                        "label": _("Biling"),
                        "items": [
                                {
                                        "type": "doctype",
                                        "name": "Notary Sales Invoice",
                                        "description": _("Notary Sales Invoice"),
                                }
			]
		},
		{
                        "label": _("Items and Prices"),
			"items": [

				{
					"type": "doctype",
					"name": "Notary Applications",
					"label": "Notary Applications (Items)",
					"description": _("Notary Applications"),
				},
				{
					"type": "doctype",
					"name": "Notary Fees",
					"label": "Notary Fees",
					"description": _("Notary Fees"),
				}
			]
		},
                {
                        "label": _("Settings"),
			"items": [
				{
					"type": "doctype",
					"name": "Notary Settings",
					"description": _("Notary Settings"),
				}
			]
		},
                {
                        "label": _("Tools"),
			"items": [
				{
					"type": "doctype",
					"name": "Period Closing Voucher",
					"label": "Fees Closing Voucheud",
					"description": _("Fees Closing Voucher"),
				}
			]
		},
		{
                        "label": _("Reproting"),
			"items": [
				{
					"type": "report",
					"is_query_report": True,
					"name": "Lead Details",
					"label": "Notary Income Details",
					"doctype": "Lead"
				},
				{
					"type": "report",
					"is_query_report": True,
					"name": "Lead Details",
					"label": "Notary Fees Details",
					"doctype": "Lead"
				}
			]
		}		
	]
