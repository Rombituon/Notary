from frappe import _

def get_data():
	return {
		'heatmap': True,
		'heatmap_message': _('This is based on transactions against this item. See dashboard below for details'),
		'fieldname': 'item_code',
#		'non_standard_fieldnames': {
#			'Production Order': 'production_item',
#			'Product Bundle': 'new_item_code',
#			'BOM': 'item',
#			'Batch': 'item'
#		},
		'transactions': [
			{
				'label': _('Sell'),
				'items': ['Notary Sales Invoice']
			}
		]
	}
