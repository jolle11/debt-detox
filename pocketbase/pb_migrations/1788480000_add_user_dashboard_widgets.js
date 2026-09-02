migrate((app) => {
	const users = app.findCollectionByNameOrId("users")
	if (!users.fields.getByName("dashboard_widgets")) {
		users.fields.add(new JSONField({ name: "dashboard_widgets", maxSize: 2048 }))
	}
	app.save(users)
}, (app) => {
	const users = app.findCollectionByNameOrId("users")
	const field = users.fields.getByName("dashboard_widgets")
	if (field) users.fields.removeById(field.id)
	app.save(users)
})
