// Optional contract figures. Zero means "not provided".
const FIELDS = ["financed_amount", "tin", "tae", "opening_fee"];

migrate(
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		for (const name of FIELDS) {
			debts.fields.add(new NumberField({ name, min: 0 }));
		}
		app.save(debts);
	},
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		for (const name of FIELDS) debts.fields.removeByName(name);
		app.save(debts);
	},
);
