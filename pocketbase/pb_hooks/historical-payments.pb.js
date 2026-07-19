routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/historical-payments",
	(e) => {
		const addMonthsToDateOnly = (dateValue, monthOffset) => {
			const dateOnly = String(dateValue).slice(0, 10);
			const year = parseInt(dateOnly.slice(0, 4), 10);
			const month = parseInt(dateOnly.slice(5, 7), 10);
			const day = parseInt(dateOnly.slice(8, 10), 10);
			const totalMonths = year * 12 + (month - 1) + monthOffset;
			const targetYear = Math.floor(totalMonths / 12);
			const targetMonth = (totalMonths % 12) + 1;
			const leapYear =
				targetYear % 4 === 0 &&
				(targetYear % 100 !== 0 || targetYear % 400 === 0);
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
			];
			const targetDay = Math.min(day, daysByMonth[targetMonth - 1]);
			const pad = (value) => (value < 10 ? `0${value}` : String(value));
			return `${targetYear}-${pad(targetMonth)}-${pad(targetDay)}`;
		};

		const debtId = e.request.pathValue("id");
		let created = 0;

		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}

			const currentPeriod = new Date().toISOString().slice(0, 7);
			const payments = txApp.findCollectionByNameOrId("payments");
			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				`debt_id = "${debt.id}" && deleted = null && is_extra_payment = false`,
				"",
				0,
				0,
			);
			const existingByPeriod = {};
			for (const existingPayment of existingPayments) {
				existingByPeriod[
					`${existingPayment.get("year")}-${existingPayment.get("month")}`
				] = existingPayment;
			}
			for (
				let offset = 0;
				offset < debt.get("number_of_payments");
				offset += 1
			) {
				const paymentDate = addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					offset,
				);
				if (paymentDate.slice(0, 7) >= currentPeriod) break;

				const month = parseInt(paymentDate.slice(5, 7), 10);
				const year = parseInt(paymentDate.slice(0, 4), 10);
				let payment = existingByPeriod[`${year}-${month}`];
				if (!payment) {
					payment = new Record(payments);
					payment.set("debt_id", debt.id);
					payment.set("month", month);
					payment.set("year", year);
					payment.set("planned_amount", debt.get("monthly_amount"));
					payment.set("is_extra_payment", false);
					created += 1;
				}
				payment.set("actual_amount", debt.get("monthly_amount"));
				payment.set("paid", true);
				payment.set("paid_date", paymentDate);
				txApp.save(payment);
			}
		});

		return e.json(200, { created });
	},
	$apis.requireAuth("users"),
);
