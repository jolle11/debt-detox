migrate((app) => {
	const payments = app.findCollectionByNameOrId("payments")
	const plannedAmount = payments.fields.getByName("planned_amount")
	plannedAmount.required = false
	app.save(payments)
}, (app) => {
	const payments = app.findCollectionByNameOrId("payments")
	const plannedAmount = payments.fields.getByName("planned_amount")
	plannedAmount.required = true
	app.save(payments)
})
