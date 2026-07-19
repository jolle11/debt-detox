// Ownership is derived from the authenticated session, never trusted from input.
onRecordCreateRequest((e) => {
	if (e.hasSuperuserAuth()) {
		return e.next();
	}
	if (!e.auth) {
		throw new UnauthorizedError("Authentication required");
	}

	e.record.set("user_id", e.auth.id);
	e.next();
}, "debts");

onRecordCreateRequest(
	(e) => {
		if (e.hasSuperuserAuth()) {
			return e.next();
		}
		if (!e.auth) {
			throw new UnauthorizedError("Authentication required");
		}

		e.record.set("user_id", e.auth.id);
		e.next();
	},
	"shared_debts",
	"shared_profiles",
);

// Even if a client submits user_id during an update, ownership cannot change.
onRecordUpdateRequest(
	(e) => {
		if (e.hasSuperuserAuth()) {
			return e.next();
		}
		if (!e.auth) {
			throw new UnauthorizedError("Authentication required");
		}

		e.record.set("user_id", e.auth.id);
		e.next();
	},
	"debts",
	"shared_debts",
	"shared_profiles",
);
