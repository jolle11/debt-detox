migrate((app) => {
	const users = app.findCollectionByNameOrId("users")
	if (!users.fields.getByName("number_format")) {
		users.fields.add(new SelectField({
			name: "number_format",
			values: ["locale", "comma_decimal", "dot_decimal"],
			maxSelect: 1,
		}))
	}
	app.save(users)
}, (app) => {
	const users = app.findCollectionByNameOrId("users")
	const field = users.fields.getByName("number_format")
	if (field) users.fields.removeById(field.id)
	app.save(users)
})
