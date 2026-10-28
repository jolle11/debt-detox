// manageRule is meant for admins managing other accounts; scoped to the user
// itself it let anyone change their own email or verified flag unchecked.
migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		users.manageRule = null;
		app.save(users);
	},
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		users.manageRule = "id = @request.auth.id";
		app.save(users);
	},
);
