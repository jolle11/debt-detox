// Existing production collections already have timestamps; clean databases need them too.
migrate(
	(app) => {
		for (const name of [
			"debts",
			"payments",
			"shared_debts",
			"shared_profiles",
		]) {
			const collection = app.findCollectionByNameOrId(name);
			if (!collection.fields.getByName("created")) {
				collection.fields.add(
					new AutodateField({ name: "created", onCreate: true }),
				);
			}
			if (!collection.fields.getByName("updated")) {
				collection.fields.add(
					new AutodateField({
						name: "updated",
						onCreate: true,
						onUpdate: true,
					}),
				);
			}
			app.save(collection);
		}
	},
	() => {
		// Keep timestamps on rollback: they may predate this migration on existing volumes.
	},
);
