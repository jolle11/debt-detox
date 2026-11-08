// Replaces the single 50/50 collaborator with a list of participants, each paying
// their own percentage. `participants` is the source of truth; `member_ids` only
// mirrors the linked accounts so API rules can match them.
const OLD_FIELDS = [
	"collaborator_id",
	"collaborator_name",
	"owner_name",
	"previous_is_shared",
];
const ACTIONS = [
	"payment_marked",
	"payment_unmarked",
	"amount_changed",
	"extra_added",
	"extra_deleted",
	"debt_completed",
	"debt_reactivated",
	"debt_edited",
	"historical_confirmed",
];

function swapRules(collection, from, to) {
	collection.listRule = collection.listRule.replace(from, to);
	collection.viewRule = collection.listRule;
}

migrate(
	(app) => {
		const users = app.findCollectionByNameOrId("users");
		const debts = app.findCollectionByNameOrId("debts");
		debts.fields.add(new JSONField({ name: "participants", maxSize: 4096 }));
		debts.fields.add(
			new RelationField({
				name: "member_ids",
				collectionId: users.id,
				maxSelect: 20,
			}),
		);
		swapRules(
			debts,
			"collaborator_id = @request.auth.id",
			"member_ids.id ?= @request.auth.id",
		);
		app.save(debts);

		const payments = app.findCollectionByNameOrId("payments");
		swapRules(
			payments,
			"debt_id.collaborator_id = @request.auth.id",
			"debt_id.member_ids.id ?= @request.auth.id",
		);
		app.save(payments);

		const activity = app.findCollectionByNameOrId("debt_activity");
		swapRules(
			activity,
			"debt_id.collaborator_id = @request.auth.id",
			"debt_id.member_ids.id ?= @request.auth.id",
		);
		activity.fields.getByName("action").values = [...ACTIONS, "split_changed"];
		app.save(activity);

		const invitations = app.findCollectionByNameOrId("debt_invitations");
		invitations.fields.add(new NumberField({ name: "percent" }));
		app.save(invitations);
		for (const invitation of app.findRecordsByFilter(
			"debt_invitations",
			"status = 'pending'",
			"",
			0,
			0,
		)) {
			invitation.set("percent", 50);
			app.save(invitation);
		}

		for (const debt of app.findRecordsByFilter(
			"debts",
			"collaborator_id != ''",
			"",
			0,
			0,
		)) {
			const owner = debt.getString("user_id");
			const collaborator = debt.getString("collaborator_id");
			debt.set("participants", [
				{ user_id: owner, name: debt.getString("owner_name"), percent: 50 },
				{
					user_id: collaborator,
					name: debt.getString("collaborator_name"),
					percent: 50,
				},
			]);
			debt.set("member_ids", [collaborator]);
			app.save(debt);

			// Every existing payment counted as half for each person.
			for (const payment of app.findRecordsByFilter(
				"payments",
				"debt_id = {:debt}",
				"",
				0,
				0,
				{ debt: debt.id },
			)) {
				const snapshot =
					JSON.parse(payment.getString("sharing_snapshot") || "null") || {};
				payment.set("sharing_snapshot", {
					owner,
					collaborator,
					owner_percent: snapshot.owner_percent ?? 50,
					shares: { [owner]: 50, [collaborator]: 50 },
				});
				app.save(payment);
			}
		}

		for (const name of OLD_FIELDS) debts.fields.removeByName(name);
		app.save(debts);
	},
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
		app.save(debts);

		// The old model holds one collaborator, so only the first one survives.
		for (const debt of app.findRecordsByFilter(
			"debts",
			"participants != '' && participants != 'null'",
			"",
			0,
			0,
		)) {
			const people = JSON.parse(debt.getString("participants") || "[]") || [];
			const owner = debt.getString("user_id");
			const member = people.find((p) => p.user_id && p.user_id !== owner);
			if (!member) continue;
			debt.set("collaborator_id", member.user_id);
			debt.set("collaborator_name", member.name);
			debt.set(
				"owner_name",
				people.find((p) => p.user_id === owner)?.name || "",
			);
			app.save(debt);
		}

		swapRules(
			debts,
			"member_ids.id ?= @request.auth.id",
			"collaborator_id = @request.auth.id",
		);
		debts.fields.removeByName("participants");
		debts.fields.removeByName("member_ids");
		app.save(debts);

		for (const name of ["payments", "debt_activity"]) {
			const collection = app.findCollectionByNameOrId(name);
			swapRules(
				collection,
				"debt_id.member_ids.id ?= @request.auth.id",
				"debt_id.collaborator_id = @request.auth.id",
			);
			if (name === "debt_activity")
				collection.fields.getByName("action").values = ACTIONS;
			app.save(collection);
		}

		const invitations = app.findCollectionByNameOrId("debt_invitations");
		invitations.fields.removeByName("percent");
		app.save(invitations);
	},
);
