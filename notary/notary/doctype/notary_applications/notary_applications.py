# -*- coding: utf-8 -*-
# Copyright (c) 2019, Eng. Bilal Ghayad and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document

class NotaryApplications(Document):
	pass


def get_timeline_data(doctype, name):
	'''returns timeline data based on notary sales invoice'''
	from six import iteritems
	from frappe.utils import (cint, cstr, flt, formatdate, get_timestamp, getdate, now_datetime, random_string, strip)

	out = {}

        '''notary sales invoice'''
	items = dict(frappe.db.sql('''select a.posting_date, count(*)
		from `tabNotary Sales Invoice` a, `tabNotary Sales Invoice Items` b 
			where item_code=%s
			and a.posting_date > date_sub(curdate(), interval 1 year)
			group by a.posting_date''', name))

	for date, count in iteritems(items):
		timestamp = get_timestamp(date)
		out.update({timestamp: count})

        return out
