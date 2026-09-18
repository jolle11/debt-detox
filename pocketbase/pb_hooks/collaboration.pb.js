routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/invite",
	(e) => {
		const data = new DynamicModel({ email: "" });
		e.bindBody(data);
		let invitation;
		e.app.runInTransaction((app) => {
			const debt = app.findRecordById("debts", e.request.pathValue("id"));
			invitation = require(`${__hooks}/lib/collaboration.js`).invite(
				app,
				debt,
				e.auth,
				data.email,
			);
		});
		return e.json(200, { invitation });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"POST",
	"/api/debt-detox/invitations/{id}/respond",
	(e) => {
		const data = new DynamicModel({ action: "" });
		e.bindBody(data);
		let result;
		e.app.runInTransaction((app) => {
			const invitation = app.findRecordById(
				"debt_invitations",
				e.request.pathValue("id"),
			);
			const sender = invitation.getString("sender_id") === e.auth.id;
			const recipient = invitation.getString("recipient_id") === e.auth.id;
			if (!sender && !recipient)
				throw new NotFoundError("Invitation not found");
			const debt = app.findRecordById("debts", invitation.getString("debt_id"));
			if (debt.getString("deleted")) throw new NotFoundError("Debt not found");
			if (invitation.getString("status") !== "pending")
				throw new BadRequestError("Invitation already resolved");
			if (data.action === "cancel" && sender)
				invitation.set("status", "cancelled");
			else if (data.action === "reject" && recipient)
				invitation.set("status", "rejected");
			else if (data.action === "accept" && recipient) {
				if (
					new Date(invitation.getString("expires_at")).getTime() <=
						Date.now() ||
					debt.getString("completed_at") ||
					debt.getString("collaborator_id")
				)
					throw new BadRequestError("Invitation no longer available");
				const owner = app.findRecordById("users", debt.getString("user_id"));
				debt.set("previous_is_shared", debt.get("is_shared"));
				debt.set("collaborator_id", e.auth.id);
				debt.set("collaborator_name", e.auth.getString("name") || "Member");
				debt.set("owner_name", owner.getString("name") || "Member");
				debt.set("is_shared", true);
				app.save(debt);
				invitation.set("status", "accepted");
			} else throw new BadRequestError("Invalid invitation action");
			app.save(invitation);
			result = invitation;
		});
		return e.json(200, { invitation: result });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"DELETE",
	"/api/debt-detox/debts/{id}/collaborator",
	(e) => {
		e.app.runInTransaction((app) => {
			const debt = app.findRecordById("debts", e.request.pathValue("id"));
			if (debt.getString("user_id") !== e.auth.id || debt.getString("deleted"))
				throw new NotFoundError("Debt not found");
			if (!debt.getString("collaborator_id")) return;
			for (const invitation of app.findRecordsByFilter(
				"debt_invitations",
				"debt_id = {:debt} && status = 'accepted'",
				"",
				0,
				0,
				{ debt: debt.id },
			)) {
				invitation.set("status", "revoked");
				app.save(invitation);
			}
			debt.set("collaborator_id", "");
			debt.set("collaborator_name", "");
			debt.set("owner_name", "");
			debt.set("is_shared", debt.get("previous_is_shared"));
			app.save(debt);
		});
		return e.json(200, { removed: true });
	},
	$apis.requireAuth("users"),
);

// Membership and audit fields are managed only by domain routes.
onRecordCreateRequest((e) => {
	if (!e.hasSuperuserAuth())
		for (const name of [
			"collaborator_id",
			"collaborator_name",
			"owner_name",
			"previous_is_shared",
		])
			e.record.set(name, name === "previous_is_shared" ? false : "");
	e.next();
}, "debts");
onRecordUpdateRequest((e) => {
	if (!e.hasSuperuserAuth()) {
		const original = e.record.original();
		for (const name of [
			"collaborator_id",
			"collaborator_name",
			"owner_name",
			"previous_is_shared",
		])
			e.record.set(name, original.get(name));
		if (original.getString("collaborator_id")) e.record.set("is_shared", true);
	}
	e.next();
}, "debts");
onRecordCreateRequest((e) => {
	if (!e.hasSuperuserAuth()) {
		const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
		require(`${__hooks}/lib/collaboration.js`).stamp(e.record, debt, e.auth);
	}
	e.next();
}, "payments");
onRecordUpdateRequest((e) => {
	if (!e.hasSuperuserAuth()) {
		const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
		require(`${__hooks}/lib/collaboration.js`).stamp(e.record, debt, e.auth);
	}
	e.next();
}, "payments");

onRecordEnrich((e) => {
	const userId = e.requestInfo?.auth?.id || "";
	if (
		!userId ||
		(e.record.getString("user_id") !== userId &&
			e.record.getString("collaborator_id") !== userId)
	)
		e.record.hide(
			"collaborator_id",
			"collaborator_name",
			"owner_name",
			"previous_is_shared",
		);
	e.next();
}, "debts");
onRecordEnrich((e) => {
	const userId = e.requestInfo?.auth?.id || "";
	const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
	if (
		!userId ||
		!require(`${__hooks}/lib/collaboration.js`).isMember(debt, userId)
	)
		e.record.hide("recorded_by", "recorded_by_name", "sharing_snapshot");
	e.next();
}, "payments");
