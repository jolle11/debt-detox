migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		if (!users.fields.getByName("hide_amounts")) {
			users.fields.add(new BoolField({ name: "hide_amounts" }));
		}
		app.save(users);
	},
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const field = users.fields.getByName("hide_amounts");
		if (field) users.fields.removeById(field.id);
		app.save(users);
	},
);
