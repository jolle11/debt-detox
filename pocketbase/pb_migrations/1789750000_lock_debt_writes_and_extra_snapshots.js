// Debts and payments are only written through the /api/debt-detox/* hooks, which
// validate input and keep collaboration invariants. Direct record writes would
// bypass those checks (e.g. setting collaborator_id without an invitation).
migrate(
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		debts.createRule = null;
		debts.updateRule = null;
		debts.deleteRule = null;
		app.save(debts);

		const payments = app.findCollectionByNameOrId("payments");
		payments.createRule = null;
		payments.updateRule = null;
		payments.deleteRule = null;
		if (!payments.fields.getByName("strategy_snapshot")) {
			payments.fields.add(
				new JSONField({ name: "strategy_snapshot", maxSize: 1024 }),
			);
		}
		app.save(payments);
	},
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		debts.createRule = "@request.auth.id != '' && user_id = @request.auth.id";
		debts.updateRule = debts.createRule;
		debts.deleteRule = debts.createRule;
		app.save(debts);

		const payments = app.findCollectionByNameOrId("payments");
		payments.createRule =
			"@request.auth.id != '' && debt_id.user_id = @request.auth.id";
		payments.updateRule = payments.createRule;
		payments.deleteRule = payments.createRule;
		payments.fields.removeByName("strategy_snapshot");
		app.save(payments);
	},
);
