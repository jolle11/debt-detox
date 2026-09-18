migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		if (!users.fields.getByName("debt_sort_by")) {
			users.fields.add(
				new SelectField({
					name: "debt_sort_by",
					values: [
						"pending",
						"remaining",
						"monthly",
						"end_date",
						"progress",
						"created",
						"name",
					],
					maxSelect: 1,
				}),
			);
		}
		if (!users.fields.getByName("debt_sort_direction")) {
			users.fields.add(
				new SelectField({
					name: "debt_sort_direction",
					values: ["asc", "desc"],
					maxSelect: 1,
				}),
			);
		}
		app.save(users);
	},
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		for (const name of ["debt_sort_by", "debt_sort_direction"]) {
			const field = users.fields.getByName(name);
			if (field) users.fields.removeById(field.id);
		}
		app.save(users);
	},
);
