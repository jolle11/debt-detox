routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/complete",
	(e) => {
		const addMonthsToDateOnly = (dateValue, monthOffset) => {
			const dateOnly = String(dateValue).slice(0, 10);
			const year = parseInt(dateOnly.slice(0, 4), 10);
			const month = parseInt(dateOnly.slice(5, 7), 10);
			const totalMonths = year * 12 + (month - 1) + monthOffset;
			const targetYear = Math.floor(totalMonths / 12);
			const targetMonth = (totalMonths % 12) + 1;
			const pad = (value) => (value < 10 ? `0${value}` : String(value));
			return `${targetYear}-${pad(targetMonth)}`;
		};

		const debtId = e.request.pathValue("id");
		let savedDebt = null;

		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}

			const today = new Date().toISOString().slice(0, 10);
			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				`debt_id = "${debt.id}" && deleted = null`,
				"",
				0,
				0,
			);
			const regularByPeriod = {};
			for (const payment of existingPayments) {
				if (!payment.get("is_extra_payment")) {
					regularByPeriod[`${payment.get("year")}-${payment.get("month")}`] =
						payment;
				}
			}

			const paymentsCollection = txApp.findCollectionByNameOrId("payments");
			const paymentCount = debt.get("number_of_payments");
			for (let offset = 0; offset < paymentCount; offset += 1) {
				const period = addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					offset,
				);
				const year = parseInt(period.slice(0, 4), 10);
				const month = parseInt(period.slice(5, 7), 10);
				let payment = regularByPeriod[`${year}-${month}`];

				if (!payment) {
					payment = new Record(paymentsCollection);
					payment.set("debt_id", debt.id);
					payment.set("month", month);
					payment.set("year", year);
					payment.set("planned_amount", debt.get("monthly_amount"));
					payment.set("is_extra_payment", false);
				}

				payment.set("paid", true);
				payment.set("actual_amount", payment.get("planned_amount"));
				payment.set("paid_date", today);
				txApp.save(payment);
			}

			const finalAmount = debt.get("final_payment") || 0;
			if (finalAmount > 0) {
				const lastMonthlyPeriod = addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					Math.max(paymentCount - 1, 0),
				);
				const configuredFinalPeriod = debt
					.getString("final_payment_date")
					.slice(0, 7);
				const finalPeriod =
					configuredFinalPeriod > lastMonthlyPeriod
						? configuredFinalPeriod
						: addMonthsToDateOnly(
								debt.getString("first_payment_date"),
								paymentCount,
							);
				const finalYear = parseInt(finalPeriod.slice(0, 4), 10);
				const finalMonth = parseInt(finalPeriod.slice(5, 7), 10);
				let finalPayment = regularByPeriod[`${finalYear}-${finalMonth}`];

				if (!finalPayment) {
					finalPayment = new Record(paymentsCollection);
					finalPayment.set("debt_id", debt.id);
					finalPayment.set("month", finalMonth);
					finalPayment.set("year", finalYear);
					finalPayment.set("planned_amount", finalAmount);
					finalPayment.set("is_extra_payment", false);
				}

				finalPayment.set("paid", true);
				finalPayment.set("actual_amount", finalAmount);
				finalPayment.set("paid_date", today);
				txApp.save(finalPayment);
			}

			debt.set("final_payment_date", today);
			txApp.save(debt);
			savedDebt = debt;
		});

		return e.json(200, { debt: savedDebt });
	},
	$apis.requireAuth("users"),
);
