const MAX_PARTICIPANTS = 20;
const round = (value) => Math.round(value * 100) / 100;
const participants = (debt) =>
	JSON.parse(debt.getString("participants") || "[]") || [];
const ownerEntry = (debt, list) =>
	list.find((person) => person.user_id === debt.getString("user_id"));

function store(debt, list) {
	const owner = debt.getString("user_id");
	const people = list.length > 1 ? list : [];
	debt.set("participants", people);
	debt.set(
		"member_ids",
		people
			.filter((person) => person.user_id && person.user_id !== owner)
			.map((person) => person.user_id),
	);
	debt.set("is_shared", people.length > 1);
}

// What an invited person will take: half of what the owner pays today.
function inviteShare(debt, list) {
	const owner = ownerEntry(debt, list);
	return round((owner ? owner.percent : 100) / 2);
}

function refreshPendingInvitation(app, debt, list) {
	for (const invitation of app.findRecordsByFilter(
		"debt_invitations",
		"debt_id = {:debt} && status = 'pending'",
		"",
		0,
		0,
		{ debt: debt.id },
	)) {
		invitation.set("percent", inviteShare(debt, list));
		app.save(invitation);
	}
}

// Fixes who paid what before a debt becomes shared, so splitting it later
// doesn't rewrite payments already made.
function freezeHistory(app, debt) {
	const owner = debt.getString("user_id");
	for (const payment of app.findRecordsByFilter(
		"payments",
		"debt_id = {:debt} && paid = true && deleted = null",
		"",
		0,
		0,
		{ debt: debt.id },
	)) {
		const snapshot =
			JSON.parse(payment.getString("sharing_snapshot") || "null") || {};
		if (snapshot.shares) continue;
		payment.set("sharing_snapshot", {
			owner,
			collaborator: "",
			owner_percent: 100,
			shares: { [owner]: 100 },
		});
		app.save(payment);
	}
}

module.exports = {
	log(app, debt, actor, action, details) {
		const entry = new Record(app.findCollectionByNameOrId("debt_activity"));
		entry.set("debt_id", debt.id);
		entry.set("actor_id", actor.id);
		entry.set("actor_name", actor.getString("name") || "Member");
		entry.set("action", action);
		if (details) {
			entry.set("year", details.year || 0);
			entry.set("month", details.month || 0);
			entry.set("amount", details.amount || 0);
		}
		app.save(entry);
	},
	participants,
	isMember(debt, userId) {
		return (
			!debt.getString("deleted") &&
			(debt.getString("user_id") === userId ||
				participants(debt).some((person) => person.user_id === userId))
		);
	},
	stamp(payment, debt, actor) {
		payment.set("recorded_by", actor.id);
		payment.set("recorded_by_name", actor.getString("name") || "Member");
		const originalSnapshot = payment.isNew()
			? null
			: JSON.parse(payment.original().getString("sharing_snapshot") || "null");
		if (originalSnapshot && originalSnapshot.owner) {
			payment.set("sharing_snapshot", originalSnapshot);
			return;
		}
		const owner = debt.getString("user_id");
		const list = participants(debt);
		const shares = {};
		for (const person of list)
			if (person.user_id) shares[person.user_id] = person.percent;
		if (!list.length) shares[owner] = 100;
		const member = list.find(
			(person) => person.user_id && person.user_id !== owner,
		);
		payment.set("sharing_snapshot", {
			owner,
			collaborator: member ? member.user_id : "",
			owner_percent: shares[owner] || 0,
			shares,
		});
	},
	invite(app, debt, actor, email) {
		if (debt.getString("user_id") !== actor.id || debt.getString("deleted"))
			throw new NotFoundError("Debt not found");
		const list = participants(debt);
		if (debt.getString("completed_at") || list.length >= MAX_PARTICIPANTS)
			throw new BadRequestError("This debt cannot be invited");
		let recipient;
		try {
			recipient = app.findFirstRecordByFilter("users", "email = {:email}", {
				email: email.trim().toLowerCase(),
			});
		} catch (_) {
			throw new BadRequestError("Unable to invite this account");
		}
		const percent = inviteShare(debt, list);
		if (
			recipient.id === actor.id ||
			list.some((person) => person.user_id === recipient.id) ||
			percent < 0.01
		)
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
		invitation.set("percent", percent);
		invitation.set(
			"expires_at",
			new Date(Date.now() + 7 * 86400000).toISOString(),
		);
		app.save(invitation);
		return invitation;
	},
	join(app, debt, user) {
		const list = participants(debt);
		if (
			list.length >= MAX_PARTICIPANTS ||
			list.some((person) => person.user_id === user.id)
		)
			throw new BadRequestError("Invitation no longer available");
		const percent = inviteShare(debt, list);
		if (percent < 0.01)
			throw new BadRequestError("Invitation no longer available");
		if (!list.length) {
			freezeHistory(app, debt);
			const owner = app.findRecordById("users", debt.getString("user_id"));
			list.push({
				user_id: owner.id,
				name: owner.getString("name") || "Member",
				percent: 100,
			});
		}
		const owner = ownerEntry(debt, list);
		owner.percent = round(owner.percent - percent);
		list.push({
			user_id: user.id,
			name: user.getString("name") || "Member",
			percent,
		});
		store(debt, list);
		app.save(debt);
	},
	removeMember(app, debt, userId) {
		const list = participants(debt);
		const member = list.find((person) => person.user_id === userId);
		if (!member || userId === debt.getString("user_id")) return;
		for (const invitation of app.findRecordsByFilter(
			"debt_invitations",
			"debt_id = {:debt} && recipient_id = {:user} && status = 'accepted'",
			"",
			0,
			0,
			{ debt: debt.id, user: userId },
		)) {
			invitation.set("status", "revoked");
			app.save(invitation);
		}
		const remaining = list.filter((person) => person !== member);
		const owner = ownerEntry(debt, remaining);
		owner.percent = round(owner.percent + member.percent);
		store(debt, remaining);
		app.save(debt);
		refreshPendingInvitation(app, debt, remaining);
	},
	updateSplit(app, debt, actor, input) {
		if (debt.getString("user_id") !== actor.id || debt.getString("deleted"))
			throw new NotFoundError("Debt not found");
		if (
			!Array.isArray(input) ||
			!input.length ||
			input.length > MAX_PARTICIPANTS
		)
			throw new BadRequestError("Invalid split");

		const current = participants(debt);
		const seen = {};
		const list = input.map((person) => {
			const percent = round(Number(person && person.percent));
			if (!(percent > 0 && percent <= 100))
				throw new BadRequestError("Invalid split");
			const userId = String(person.user_id || "");
			if (!userId) {
				const name = String(person.name || "").trim();
				if (!name || name.length > 100)
					throw new BadRequestError("Invalid split");
				return { user_id: "", name, percent };
			}
			const known = current.find((entry) => entry.user_id === userId);
			if (seen[userId] || (!known && userId !== actor.id))
				throw new BadRequestError("Invalid split");
			seen[userId] = true;
			return {
				user_id: userId,
				name: known ? known.name : actor.getString("name") || "Member",
				percent,
			};
		});
		const total = list.reduce((sum, person) => sum + person.percent, 0);
		if (
			!seen[actor.id] ||
			Math.abs(total - 100) > 0.005 ||
			current.some((entry) => entry.user_id && !seen[entry.user_id])
		)
			throw new BadRequestError("Invalid split");

		if (!current.length) freezeHistory(app, debt);
		store(debt, list);
		app.save(debt);
		refreshPendingInvitation(app, debt, list);
		module.exports.log(app, debt, actor, "split_changed");
	},
};
