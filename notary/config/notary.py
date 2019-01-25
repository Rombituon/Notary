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
                        "label": _("Reproting"),
			"items": [
			]
		}		
	]
