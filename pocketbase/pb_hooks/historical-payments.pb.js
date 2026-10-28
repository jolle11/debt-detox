routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/historical-payments",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const dates = require(`${__hooks}/lib/dates.js`);
		const { addMonthsToDateOnly } = dates;

		const debtId = e.request.pathValue("id");
		let created = 0;

		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}

			const currentPeriod = dates.today(e).slice(0, 7);
			const payments = txApp.findCollectionByNameOrId("payments");
			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				"debt_id = {:debt} && deleted = null && is_extra_payment = false",
				"",
				0,
				0,
				{ debt: debt.id },
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
				collaboration.stamp(payment, debt, e.auth);
				txApp.save(payment);
			}
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"historical_confirmed",
			);
		});

		return e.json(200, { created });
	},
	$apis.requireAuth("users"),
);
