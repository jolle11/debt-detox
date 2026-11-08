routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/invite",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const data = new DynamicModel({ email: "" });
		e.bindBody(data);
		let invitation;
		e.app.runInTransaction((app) => {
			const debt = app.findRecordById("debts", e.request.pathValue("id"));
			invitation = collaboration.invite(
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
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
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
					debt.getString("completed_at")
				)
					throw new BadRequestError("Invitation no longer available");
				collaboration.join(app, debt, e.auth);
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
	"/api/debt-detox/debts/{id}/participants/{userId}",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		e.app.runInTransaction((app) => {
			const debt = app.findRecordById("debts", e.request.pathValue("id"));
			if (debt.getString("user_id") !== e.auth.id || debt.getString("deleted"))
				throw new NotFoundError("Debt not found");
			collaboration.removeMember(app, debt, e.request.pathValue("userId"));
		});
		return e.json(200, { removed: true });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"PUT",
	"/api/debt-detox/debts/{id}/participants",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		let body;
		try {
			body = JSON.parse(toString(e.request.body));
		} catch (_) {
			throw new BadRequestError("Invalid split");
		}
		let saved;
		e.app.runInTransaction((app) => {
			const debt = app.findRecordById("debts", e.request.pathValue("id"));
			collaboration.updateSplit(app, debt, e.auth, body.participants);
			saved = debt;
		});
		return e.json(200, { debt: saved });
	},
	$apis.requireAuth("users"),
);

// Membership and audit fields are managed only by domain routes.
onRecordCreateRequest((e) => {
	if (!e.hasSuperuserAuth()) {
		e.record.set("participants", []);
		e.record.set("member_ids", []);
	}
	e.next();
}, "debts");
onRecordUpdateRequest((e) => {
	if (!e.hasSuperuserAuth()) {
		const original = e.record.original();
		for (const name of ["participants", "member_ids"])
			e.record.set(name, original.get(name));
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		if (collaboration.participants(original).length)
			e.record.set("is_shared", true);
	}
	e.next();
}, "debts");
onRecordCreateRequest((e) => {
	const collaboration = require(`${__hooks}/lib/collaboration.js`);
	if (!e.hasSuperuserAuth()) {
		const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
		collaboration.stamp(e.record, debt, e.auth);
	}
	e.next();
}, "payments");
onRecordUpdateRequest((e) => {
	const collaboration = require(`${__hooks}/lib/collaboration.js`);
	if (!e.hasSuperuserAuth()) {
		const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
		collaboration.stamp(e.record, debt, e.auth);
	}
	e.next();
}, "payments");

onRecordEnrich((e) => {
	const collaboration = require(`${__hooks}/lib/collaboration.js`);
	const userId = e.requestInfo?.auth?.id || "";
	const list = collaboration.participants(e.record);
	const member = !!userId && collaboration.isMember(e.record, userId);
	if (!member)
		e.record.hide(
			"participants",
			"member_ids",
			"financed_amount",
			"tin",
			"tae",
			"opening_fee",
		);
	if (list.length) {
		// Outsiders only reach a debt through its owner's public links.
		const viewer = member ? userId : e.record.getString("user_id");
		const person = list.find((entry) => entry.user_id === viewer);
		e.record.withCustomData(true);
		e.record.set("my_percent", person ? person.percent : 0);
	}
	e.next();
}, "debts");
onRecordEnrich((e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
	const userId = e.requestInfo?.auth?.id || "";
	const debt = e.app.findRecordById("debts", e.record.getString("debt_id"));
	if (
		!userId ||
		!collaboration.isMember(debt, userId)
	)
		e.record.hide("recorded_by", "recorded_by_name", "sharing_snapshot");
	else {
		const snapshot = JSON.parse(
			e.record.getString("sharing_snapshot") || "null",
		);
		if (snapshot && snapshot.shares) {
			e.record.withCustomData(true);
			e.record.set("my_percent", snapshot.shares[userId] || 0);
		}
	}
	e.next();
}, "payments");
