migrate(
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		debts.fields.add(new BoolField({ name: "is_shared" }));
		app.save(debts);
	},
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		const isShared = debts.fields.getByName("is_shared");
		debts.fields.removeById(isShared.id);
		app.save(debts);
	},
);
