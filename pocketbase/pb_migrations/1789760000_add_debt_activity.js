// Append-only history of who changed what on a debt, written by the domain routes.
migrate(
	(app) => {
		const debts = app.findCollectionByNameOrId("debts");
		const memberRule =
			"@request.auth.id != '' && debt_id.deleted = null && (debt_id.user_id = @request.auth.id || debt_id.collaborator_id = @request.auth.id)";
		app.save(
			new Collection({
				name: "debt_activity",
				type: "base",
				listRule: memberRule,
				viewRule: memberRule,
				createRule: null,
				updateRule: null,
				deleteRule: null,
				fields: [
					{
						type: "relation",
						name: "debt_id",
						collectionId: debts.id,
						maxSelect: 1,
						required: true,
						cascadeDelete: true,
					},
					{ type: "text", name: "actor_id", max: 15 },
					{ type: "text", name: "actor_name", max: 200 },
					{
						type: "select",
						name: "action",
						values: [
							"payment_marked",
							"payment_unmarked",
							"amount_changed",
							"extra_added",
							"extra_deleted",
							"debt_completed",
							"debt_reactivated",
							"debt_edited",
							"historical_confirmed",
						],
						maxSelect: 1,
						required: true,
					},
					{ type: "number", name: "year" },
					{ type: "number", name: "month" },
					{ type: "number", name: "amount" },
					{ type: "autodate", name: "created", onCreate: true },
				],
				indexes: [
					"CREATE INDEX idx_debt_activity_debt ON debt_activity (debt_id, created)",
				],
			}),
		);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("debt_activity"));
	},
);
