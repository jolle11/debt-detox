migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const debts = app.findCollectionByNameOrId("debts");
		debts.fields.add(
			new RelationField({
				name: "collaborator_id",
				collectionId: users.id,
				maxSelect: 1,
			}),
		);
		debts.fields.add(new TextField({ name: "collaborator_name", max: 200 }));
		debts.fields.add(new TextField({ name: "owner_name", max: 200 }));
		debts.fields.add(new BoolField({ name: "previous_is_shared" }));
		debts.listRule = debts.listRule.replace(
			"user_id = @request.auth.id)",
			"(user_id = @request.auth.id || collaborator_id = @request.auth.id))",
		);
		debts.viewRule = debts.listRule;
		app.save(debts);
		const payments = app.findCollectionByNameOrId("payments");
		payments.fields.add(new TextField({ name: "recorded_by", max: 15 }));
		payments.fields.add(new TextField({ name: "recorded_by_name", max: 200 }));
		payments.fields.add(
			new JSONField({ name: "sharing_snapshot", maxSize: 1024 }),
		);
		payments.listRule = payments.listRule.replace(
			"debt_id.user_id = @request.auth.id)",
			"(debt_id.user_id = @request.auth.id || debt_id.collaborator_id = @request.auth.id))",
		);
		payments.listRule = "debt_id.deleted = null && (" + payments.listRule + ")";
		payments.viewRule = payments.listRule;
		app.save(payments);
		app.save(
			new Collection({
				name: "debt_invitations",
				type: "base",
				listRule:
					"@request.auth.id != '' && debt_id.deleted = null && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
				viewRule:
					"@request.auth.id != '' && debt_id.deleted = null && (sender_id = @request.auth.id || recipient_id = @request.auth.id)",
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
					{
						type: "relation",
						name: "sender_id",
						collectionId: users.id,
						maxSelect: 1,
						required: true,
						cascadeDelete: true,
					},
					{
						type: "relation",
						name: "recipient_id",
						collectionId: users.id,
						maxSelect: 1,
						required: true,
						cascadeDelete: true,
					},
					{ type: "text", name: "debt_name", required: true, max: 200 },
					{ type: "text", name: "sender_name", max: 200 },
					{ type: "text", name: "recipient_name", max: 200 },
					{
						type: "select",
						name: "status",
						values: ["pending", "accepted", "rejected", "cancelled", "revoked"],
						maxSelect: 1,
						required: true,
					},
					{ type: "date", name: "expires_at", required: true },
					{ type: "autodate", name: "created", onCreate: true },
					{ type: "autodate", name: "updated", onCreate: true, onUpdate: true },
				],
				indexes: [
					"CREATE UNIQUE INDEX idx_debt_pending_invitation ON debt_invitations (debt_id) WHERE status = 'pending'",
				],
			}),
		);
	},
	(app) => {
		app.delete(app.findCollectionByNameOrId("debt_invitations"));
		const debts = app.findCollectionByNameOrId("debts");
		debts.listRule = debts.listRule.replace(
			"(user_id = @request.auth.id || collaborator_id = @request.auth.id)",
			"user_id = @request.auth.id",
		);
		debts.viewRule = debts.listRule;
		for (const name of [
			"collaborator_id",
			"collaborator_name",
			"owner_name",
			"previous_is_shared",
		])
			debts.fields.removeById(debts.fields.getByName(name).id);
		app.save(debts);
		const payments = app.findCollectionByNameOrId("payments");
		payments.listRule = payments.listRule.replace(
			"(debt_id.user_id = @request.auth.id || debt_id.collaborator_id = @request.auth.id)",
			"debt_id.user_id = @request.auth.id",
		);
		payments.viewRule = payments.listRule;
		for (const name of ["recorded_by", "recorded_by_name", "sharing_snapshot"])
			payments.fields.removeById(payments.fields.getByName(name).id);
		app.save(payments);
	},
);
