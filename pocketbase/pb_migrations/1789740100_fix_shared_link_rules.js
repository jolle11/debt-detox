// Match the qualifying link, rather than requiring every historical link to be active.
migrate(
	(app) => {
		for (const name of ["users", "debts", "payments"]) {
			const collection = app.findCollectionByNameOrId(name);
			for (const rule of ["listRule", "viewRule"]) {
				if (!collection[rule]) continue;
				collection[rule] = collection[rule]
					.replace(
						/(@collection\.shared_(?:debts|profiles)\.deleted) = null/g,
						"$1 ?= null",
					)
					.replace(
						/(@collection\.shared_(?:debts|profiles)\.expires_at) > @now/g,
						"$1 ?> @now",
					);
			}
			app.save(collection);
		}
	},
	(app) => {
		for (const name of ["users", "debts", "payments"]) {
			const collection = app.findCollectionByNameOrId(name);
			for (const rule of ["listRule", "viewRule"]) {
				if (!collection[rule]) continue;
				collection[rule] = collection[rule]
					.replace(
						/(@collection\.shared_(?:debts|profiles)\.deleted) \?= null/g,
						"$1 = null",
					)
					.replace(
						/(@collection\.shared_(?:debts|profiles)\.expires_at) \?> @now/g,
						"$1 > @now",
					);
			}
			app.save(collection);
		}
	},
);
