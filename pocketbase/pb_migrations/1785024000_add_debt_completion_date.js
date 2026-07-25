const addMonthsToDateOnly = (dateValue, monthOffset) => {
	const dateOnly = String(dateValue).slice(0, 10)
	const year = parseInt(dateOnly.slice(0, 4), 10)
	const month = parseInt(dateOnly.slice(5, 7), 10)
	const day = parseInt(dateOnly.slice(8, 10), 10)
	const totalMonths = year * 12 + (month - 1) + monthOffset
	const targetYear = Math.floor(totalMonths / 12)
	const targetMonth = (totalMonths % 12) + 1
	const leapYear =
		targetYear % 4 === 0 &&
		(targetYear % 100 !== 0 || targetYear % 400 === 0)
	const daysByMonth = [
		31,
		leapYear ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31,
	]
	const targetDay = Math.min(day, daysByMonth[targetMonth - 1])
	const pad = (value) => (value < 10 ? `0${value}` : String(value))
	return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`
}

migrate((app) => {
	const debts = app.findCollectionByNameOrId("debts")
	debts.fields.add(new DateField({ name: "completed_at" }))
	app.save(debts)

	// The previous implementation stored the real completion date in
	// final_payment_date. Backfill only debts whose complete payment plan exists,
	// then restore their scheduled final date.
	const records = app.findRecordsByFilter("debts", "deleted = null", "", 0, 0)
	for (const debt of records) {
		const expectedPayments =
			debt.get("number_of_payments") +
			((debt.get("final_payment") || 0) > 0 ? 1 : 0)
		const paidPayments = app.findRecordsByFilter(
			"payments",
			`debt_id = "${debt.id}" && deleted = null && is_extra_payment = false && paid = true`,
			"",
			0,
			0,
		)
		if (
			expectedPayments <= 0 ||
			paidPayments.length < expectedPayments ||
			!debt.getString("final_payment_date")
		) {
			continue
		}

		debt.set("completed_at", debt.getString("final_payment_date").slice(0, 10))
		const hasFinalPayment = (debt.get("final_payment") || 0) > 0
		const finalMonthOffset =
			debt.get("number_of_payments") - 1 + (hasFinalPayment ? 1 : 0)
		debt.set(
			"final_payment_date",
			addMonthsToDateOnly(
				debt.getString("first_payment_date"),
				Math.max(finalMonthOffset, 0),
			),
		)
		app.save(debt)
	}
}, (app) => {
	const debts = app.findCollectionByNameOrId("debts")
	const completedAt = debts.fields.getByName("completed_at")
	debts.fields.removeById(completedAt.id)
	app.save(debts)
})
