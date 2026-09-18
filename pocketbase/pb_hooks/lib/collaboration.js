module.exports = {
	isMember(debt, userId) {
		return (
			!debt.getString("deleted") &&
			(debt.getString("user_id") === userId ||
				debt.getString("collaborator_id") === userId)
		);
	},
	stamp(payment, debt, actor) {
		payment.set("recorded_by", actor.id);
		payment.set("recorded_by_name", actor.getString("name") || "Member");
		const originalSnapshot = payment.isNew()
			? null
			: JSON.parse(payment.original().getString("sharing_snapshot") || "null");
		payment.set(
			"sharing_snapshot",
			originalSnapshot && originalSnapshot.owner
				? originalSnapshot
				: {
						owner: debt.getString("user_id"),
						collaborator: debt.getString("collaborator_id"),
						owner_percent: debt.getString("collaborator_id") ? 50 : 100,
					},
		);
	},
	invite(app, debt, actor, email) {
		if (debt.getString("user_id") !== actor.id || debt.getString("deleted"))
			throw new NotFoundError("Debt not found");
		if (debt.getString("collaborator_id") || debt.getString("completed_at"))
			throw new BadRequestError("This debt cannot be invited");
		let recipient;
		try {
			recipient = app.findFirstRecordByFilter("users", "email = {:email}", {
				email: email.trim().toLowerCase(),
			});
		} catch (_) {
			throw new BadRequestError("Unable to invite this account");
		}
		if (recipient.id === actor.id)
			throw new BadRequestError("Unable to invite this account");
		const pending = app.findRecordsByFilter(
			"debt_invitations",
			"debt_id = {:debt} && status = 'pending'",
			"",
			0,
			0,
			{ debt: debt.id },
		);
		for (const invitation of pending) {
			if (new Date(invitation.getString("expires_at")).getTime() > Date.now())
				throw new BadRequestError("An invitation is already pending");
			invitation.set("status", "cancelled");
			app.save(invitation);
		}
		const invitation = new Record(
			app.findCollectionByNameOrId("debt_invitations"),
		);
		invitation.set("debt_id", debt.id);
		invitation.set("debt_name", debt.getString("name"));
		invitation.set("sender_id", actor.id);
		invitation.set("recipient_id", recipient.id);
		invitation.set("sender_name", actor.getString("name") || "Member");
		invitation.set("recipient_name", recipient.getString("name") || "Member");
		invitation.set("status", "pending");
		invitation.set(
			"expires_at",
			new Date(Date.now() + 7 * 86400000).toISOString(),
		);
		app.save(invitation);
		return invitation;
	},
};
