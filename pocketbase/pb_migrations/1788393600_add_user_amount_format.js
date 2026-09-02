migrate((app) => {
	const users = app.findCollectionByNameOrId("users")
	if (!users.fields.getByName("amount_format")) {
		users.fields.add(new SelectField({
			name: "amount_format",
			values: ["automatic", "two_decimals", "no_decimals"],
			maxSelect: 1,
		}))
	}
	app.save(users)
}, (app) => {
	const users = app.findCollectionByNameOrId("users")
	const field = users.fields.getByName("amount_format")
	if (field) users.fields.removeById(field.id)
	app.save(users)
})
