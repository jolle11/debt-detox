routerAdd(
	"DELETE",
	"/api/debt-detox/debts/{id}",
	(e) => {
		const debtId = e.request.pathValue("id");
		let deletedAt = "";

		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}
			if (debt.getString("deleted")) {
				deletedAt = debt.getString("deleted");
				return;
			}

			deletedAt = new Date().toISOString().replace("T", " ");
			const payments = txApp.findRecordsByFilter(
				"payments",
				`debt_id = "${debt.id}"`,
				"",
				0,
				0,
			);
			for (const payment of payments) {
				if (!payment.getString("deleted")) {
					payment.set("deleted", deletedAt);
					txApp.save(payment);
				}
			}

			const sharedLinks = txApp.findRecordsByFilter(
				"shared_debts",
				`debt_id = "${debt.id}"`,
				"",
				0,
				0,
			);
			for (const link of sharedLinks) {
				if (!link.getString("deleted")) {
					link.set("deleted", deletedAt);
					txApp.save(link);
				}
			}

			debt.set("deleted", deletedAt);
			txApp.save(debt);
		});

		return e.json(200, { deleted: true, deletedAt });
	},
	$apis.requireAuth("users"),
);
