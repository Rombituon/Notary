# -*- coding: utf-8 -*-
# Copyright (c) 2019, Eng. Bilal Ghayad and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
from frappe.model.document import Document
from erpnext.accounts.general_ledger import make_gl_entries
from erpnext.accounts.general_ledger import delete_gl_entries
from erpnext.controllers.accounts_controller import AccountsController
from frappe import utils

#class NotarySalesInvoice(Document):
class NotarySalesInvoice(AccountsController):
#	pass
	def on_cancel(self):

		delete_gl_entries(voucher_type=self.doctype, voucher_no=self.name)


	def on_submit(self):
		if (self.grand_total != 0):
			self.make_gl_entries()

	def make_gl_entries(self):

		customer_gl_entries =  self.get_gl_dict({
			"account": self.receivable_account,
			"against": self.income_account,
			"party_type": "Customer",
			"party": self.customer,
			"debit": self.grand_total * self.currency_conversion,
			"debit_in_account_currency": self.grand_total * self.currency_conversion,
			"against_voucher": self.name,
			"against_voucher_type": self.doctype,
			"cost_center": self.cost_center
		})


		income_gl_entry = self.get_gl_dict({
			"account": self.income_account,
			"against": self.customer,
			"credit": self.grand_total * self.currency_conversion,
			"credit_in_account_currency": self.grand_total * self.currency_conversion,
			"against_voucher": self.name,
			"against_voucher_type": self.doctype,
			"cost_center": self.cost_center
		})

		make_gl_entries([customer_gl_entries, income_gl_entry], cancel=(self.docstatus == 2),
			update_outstanding="No", merge_entries=False)


		if self.total_paid_amount > 0:

			customer_gl_entries =  self.get_gl_dict({
				"account": self.receivable_account,
				"party_type": "Customer",
				"party": self.customer,
				"against": self.cash_account,
				"credit": self.total_paid_amount,
				"credit_in_account_currency": self.total_paid_amount,
				"against_voucher": self.name,
				"against_voucher_type": self.doctype
			})

			paid_to_gl_entry = self.get_gl_dict({
				"account": self.cash_account,
				"against": self.customer,
				"debit": self.total_paid_amount,
				"debit_in_account_currency": self.total_paid_amount,
				"against_voucher": self.name,
				"against_voucher_type": self.doctype,
				"cost_center": self.cost_center
			})


			make_gl_entries([customer_gl_entries, paid_to_gl_entry], cancel=(self.docstatus == 2),
				update_outstanding="No", merge_entries=False)

@frappe.whitelist()
def get_currency_rate(currency, invoice_date):

	rate = frappe.db.sql("""select exchange_rate from `tabCurrency Exchange` where from_currency = %s and date <= %s order by date desc limit 1""", (currency, invoice_date), as_dict=True)

	if len(rate) == 0:
		return None
	else:
		return rate[0]['exchange_rate']

@frappe.whitelist()
def get_company_accounts(company):

	company_accounts = frappe.db.sql("""select default_receivable_account, default_income_account, cost_center, default_cash_account from `tabCompany` where company_name = %s""", (company), as_dict=True)

	return company_accounts

@frappe.whitelist()
def get_customer_currency(customer):

#        company_accounts = frappe.db.sql("""select default_receivable_account, default_payable_account, default_income_account, cost_center, default_cash_account from `tabCompany` where company_name = %s""", (company), as_dict=True)

	customer_curr = frappe.get_value("Customer", customer, "default_currency")
#       frappe.msgprint("The company accounts are: {0}". format(company_accounts))
#       return receivable_acc, payable_acc
	return customer_curr

@frappe.whitelist()
def get_item_details(item_code):


#	frappe.msgprint("The received item code is: {0}". format(item_code))



	fees_details = frappe.db.sql("""select fees_code, fees_name, notary_fees_account, fees_type, price, percentage from `tabNotary Applications Fees` 
			where parenttype = "Notary Applications" and parent = %s""", (item_code), as_dict=True)


#	frappe.msgprint("The fees_details for the item code {0} is {1}". format(item_code, fees_details))

	return fees_details
