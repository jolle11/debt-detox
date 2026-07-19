migrate((app) => {
	// PocketBase creates a default users auth collection on first boot.
	const users = app.findCollectionByNameOrId("users")
	users.listRule = "id = @request.auth.id"
	users.viewRule = "id = @request.auth.id"
	users.createRule = ""
	users.updateRule = "id = @request.auth.id"
	users.deleteRule = "id = @request.auth.id"
	users.manageRule = "id = @request.auth.id"
	if (!users.fields.getByName("currency")) {
		users.fields.add(new TextField({ name: "currency", max: 3 }))
	}
	app.save(users)

	// When adopting an existing PocketBase volume, preserve all records and IDs.
	// Only bring its schema/rules under version control instead of recreating it.
	let existingDebts = null
	try {
		existingDebts = app.findCollectionByNameOrId("debts")
	} catch (_) {
		// A clean database continues through the collection creation below.
	}

	if (existingDebts) {
		const existingPayments = app.findCollectionByNameOrId("payments")
		const existingSharedDebts = app.findCollectionByNameOrId("shared_debts")
		const existingSharedProfiles = app.findCollectionByNameOrId("shared_profiles")

		if (!existingDebts.fields.getByName("original_monthly_amount")) {
			existingDebts.fields.add(new NumberField({ name: "original_monthly_amount", min: 0 }))
		}
		if (!existingDebts.fields.getByName("original_number_of_payments")) {
			existingDebts.fields.add(new NumberField({ name: "original_number_of_payments", min: 1, onlyInt: true }))
		}

		users.viewRule = "id = @request.auth.id || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.user_id ?= id && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.user_id ?= id && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now)))"
		app.save(users)

		existingDebts.listRule = "deleted = null && ((@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= id) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= user_id))))"
		existingDebts.viewRule = existingDebts.listRule
		existingDebts.createRule = "@request.auth.id != '' && user_id = @request.auth.id"
		existingDebts.updateRule = existingDebts.createRule
		existingDebts.deleteRule = existingDebts.createRule
		app.save(existingDebts)

		existingPayments.listRule = "deleted = null && ((@request.auth.id != '' && debt_id.user_id = @request.auth.id) || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= debt_id) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= debt_id.user_id))))"
		existingPayments.viewRule = existingPayments.listRule
		existingPayments.createRule = "@request.auth.id != '' && debt_id.user_id = @request.auth.id"
		existingPayments.updateRule = existingPayments.createRule
		existingPayments.deleteRule = existingPayments.createRule
		app.save(existingPayments)

		existingSharedDebts.listRule = "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)"
		existingSharedDebts.viewRule = existingSharedDebts.listRule
		existingSharedDebts.createRule = "@request.auth.id != '' && user_id = @request.auth.id && debt_id.user_id = @request.auth.id"
		existingSharedDebts.updateRule = existingSharedDebts.createRule
		existingSharedDebts.deleteRule = "@request.auth.id != '' && user_id = @request.auth.id"
		app.save(existingSharedDebts)

		existingSharedProfiles.listRule = "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)"
		existingSharedProfiles.viewRule = existingSharedProfiles.listRule
		existingSharedProfiles.createRule = "@request.auth.id != '' && user_id = @request.auth.id"
		existingSharedProfiles.updateRule = existingSharedProfiles.createRule
		existingSharedProfiles.deleteRule = existingSharedProfiles.createRule
		app.save(existingSharedProfiles)
		return
	}

	const debts = new Collection({
		type: "base",
		name: "debts",
		listRule: "deleted = null && user_id = @request.auth.id",
		viewRule: "deleted = null && user_id = @request.auth.id",
		createRule: "@request.auth.id != '' && user_id = @request.auth.id",
		updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
		deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
		fields: [
			{ type: "relation", name: "user_id", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
			{ type: "text", name: "name", required: true, max: 200 },
			{ type: "text", name: "entity", required: true, max: 200 },
			{ type: "number", name: "down_payment", min: 0 },
			{ type: "date", name: "first_payment_date", required: true },
			{ type: "number", name: "monthly_amount", required: true, min: 0 },
			{ type: "number", name: "number_of_payments", required: true, min: 1, onlyInt: true },
			{ type: "number", name: "original_monthly_amount", min: 0 },
			{ type: "number", name: "original_number_of_payments", min: 1, onlyInt: true },
			{ type: "number", name: "final_payment", min: 0 },
			{ type: "date", name: "final_payment_date" },
			{ type: "file", name: "product_image", maxSelect: 1, maxSize: 5242880, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"] },
			{ type: "date", name: "deleted" },
		],
		indexes: ["CREATE INDEX `idx_debts_user_deleted` ON `debts` (`user_id`, `deleted`)"]
	})
	app.save(debts)

	const payments = new Collection({
		type: "base",
		name: "payments",
		listRule: "deleted = null && debt_id.user_id = @request.auth.id",
		viewRule: "deleted = null && debt_id.user_id = @request.auth.id",
		createRule: "@request.auth.id != '' && debt_id.user_id = @request.auth.id",
		updateRule: "@request.auth.id != '' && debt_id.user_id = @request.auth.id",
		deleteRule: "@request.auth.id != '' && debt_id.user_id = @request.auth.id",
		fields: [
			{ type: "relation", name: "debt_id", required: true, maxSelect: 1, collectionId: debts.id, cascadeDelete: true },
			{ type: "number", name: "month", required: true, min: 1, max: 12, onlyInt: true },
			{ type: "number", name: "year", required: true, min: 2000, max: 9999, onlyInt: true },
			{ type: "number", name: "planned_amount", required: true, min: 0 },
			{ type: "number", name: "actual_amount", min: 0 },
			{ type: "bool", name: "paid" },
			{ type: "date", name: "paid_date" },
			{ type: "bool", name: "is_extra_payment" },
			{ type: "date", name: "deleted" },
		],
		indexes: ["CREATE INDEX `idx_payments_debt_date` ON `payments` (`debt_id`, `year`, `month`)"]
	})
	app.save(payments)

	const sharedDebts = new Collection({
		type: "base",
		name: "shared_debts",
		listRule: "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)",
		viewRule: "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)",
		createRule: "@request.auth.id != '' && user_id = @request.auth.id && debt_id.user_id = @request.auth.id",
		updateRule: "@request.auth.id != '' && user_id = @request.auth.id && debt_id.user_id = @request.auth.id",
		deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
		fields: [
			{ type: "text", name: "token", required: true, min: 32, max: 64 },
			{ type: "relation", name: "debt_id", required: true, maxSelect: 1, collectionId: debts.id, cascadeDelete: true },
			{ type: "relation", name: "user_id", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
			{ type: "date", name: "expires_at", required: true },
			{ type: "bool", name: "show_amounts" },
			{ type: "bool", name: "show_entity" },
			{ type: "bool", name: "show_dates" },
			{ type: "date", name: "deleted" },
		],
		indexes: ["CREATE UNIQUE INDEX `idx_shared_debts_token` ON `shared_debts` (`token`)"]
	})
	app.save(sharedDebts)

	const sharedProfiles = new Collection({
		type: "base",
		name: "shared_profiles",
		listRule: "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)",
		viewRule: "(@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && token = @request.headers.x_share_token && deleted = null && expires_at > @now)",
		createRule: "@request.auth.id != '' && user_id = @request.auth.id",
		updateRule: "@request.auth.id != '' && user_id = @request.auth.id",
		deleteRule: "@request.auth.id != '' && user_id = @request.auth.id",
		fields: [
			{ type: "text", name: "token", required: true, min: 32, max: 64 },
			{ type: "relation", name: "user_id", required: true, maxSelect: 1, collectionId: users.id, cascadeDelete: true },
			{ type: "date", name: "expires_at", required: true },
			{ type: "bool", name: "show_amounts" },
			{ type: "bool", name: "show_debt_list" },
			{ type: "bool", name: "show_completed" },
			{ type: "date", name: "deleted" },
		],
		indexes: ["CREATE UNIQUE INDEX `idx_shared_profiles_token` ON `shared_profiles` (`token`)"]
	})
	app.save(sharedProfiles)

	// Add cross-collection share access only after all referenced collections exist.
	users.viewRule = "id = @request.auth.id || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.user_id ?= id && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.user_id ?= id && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now)))"
	app.save(users)

	debts.listRule = "deleted = null && ((@request.auth.id != '' && user_id = @request.auth.id) || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= id) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= user_id))))"
	debts.viewRule = debts.listRule
	app.save(debts)

	payments.listRule = "deleted = null && ((@request.auth.id != '' && debt_id.user_id = @request.auth.id) || (@request.headers.x_share_token != '' && ((@collection.shared_debts.token ?= @request.headers.x_share_token && @collection.shared_debts.deleted = null && @collection.shared_debts.expires_at > @now && @collection.shared_debts.debt_id ?= debt_id) || (@collection.shared_profiles.token ?= @request.headers.x_share_token && @collection.shared_profiles.deleted = null && @collection.shared_profiles.expires_at > @now && @collection.shared_profiles.user_id ?= debt_id.user_id))))"
	payments.viewRule = payments.listRule
	app.save(payments)
})
