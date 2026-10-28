routerAdd(
	"PUT",
	"/api/debt-detox/debts/{id}/payments/{year}/{month}",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const dates = require(`${__hooks}/lib/dates.js`);
		const { addMonthsToDateOnly } = dates;

		const data = new DynamicModel({
			actual_amount: -0,
			paid_date: "",
		});
		e.bindBody(data);

		const debtId = e.request.pathValue("id");
		const year = parseInt(e.request.pathValue("year"), 10);
		const month = parseInt(e.request.pathValue("month"), 10);
		if (year < 2000 || year > 9999 || month < 1 || month > 12) {
			throw new BadRequestError("Invalid payment period");
		}

		let savedPayment = null;
		let savedDebt = null;
		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (
				!collaboration.isMember(debt, e.auth.id)
			) {
				throw new NotFoundError("Debt not found");
			}

			const requestedPeriod = dates.periodOf(year, month);
			let plannedAmount = null;
			for (
				let offset = 0;
				offset < debt.get("number_of_payments");
				offset += 1
			) {
				const period = addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					offset,
				).slice(0, 7);
				if (period === requestedPeriod) {
					plannedAmount = debt.get("monthly_amount");
					break;
				}
			}

			const finalPaymentDate = dates.finalPaymentDate(debt);
			if (
				plannedAmount === null &&
				finalPaymentDate.slice(0, 7) === requestedPeriod
			) {
				plannedAmount = debt.get("final_payment");
			}

			if (plannedAmount === null) {
				throw new BadRequestError("Payment period is outside the debt plan");
			}

			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				"debt_id = {:debt} && year = {:year} && month = {:month} && is_extra_payment = false",
				"",
				0,
				0,
				{ debt: debt.id, year, month },
			);
			let payment = existingPayments[0];
			if (!payment) {
				const payments = txApp.findCollectionByNameOrId("payments");
				payment = new Record(payments);
				payment.set("debt_id", debt.id);
				payment.set("year", year);
				payment.set("month", month);
				payment.set("is_extra_payment", false);
			}

			if (
				debt.getString("collaborator_id") &&
				payment.get("paid") &&
				!payment.getString("deleted")
			) {
				savedPayment = payment;
				savedDebt = debt;
				return;
			}
			payment.set("deleted", null);
			payment.set("planned_amount", plannedAmount);
			payment.set(
				"actual_amount",
				data.actual_amount > 0 ? data.actual_amount : plannedAmount,
			);
			payment.set("paid", true);
			payment.set(
				"paid_date",
				dates.isDateOnly(data.paid_date) ? data.paid_date : dates.today(e),
			);
			collaboration.stamp(payment, debt, e.auth);
			txApp.save(payment);
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"payment_marked",
				{ year, month, amount: payment.get("actual_amount") },
			);

			const expectedPeriods = {};
			for (
				let offset = 0;
				offset < debt.get("number_of_payments");
				offset += 1
			) {
				expectedPeriods[
					addMonthsToDateOnly(
						debt.getString("first_payment_date"),
						offset,
					).slice(0, 7)
				] = true;
			}
			if (finalPaymentDate) {
				expectedPeriods[finalPaymentDate.slice(0, 7)] = true;
			}

			const paidPayments = txApp.findRecordsByFilter(
				"payments",
				"debt_id = {:debt} && deleted = null && is_extra_payment = false && paid = true",
				"",
				0,
				0,
				{ debt: debt.id },
			);
			const paidPeriods = {};
			for (const paidPayment of paidPayments) {
				paidPeriods[
					`${paidPayment.get("year")}-${
						paidPayment.get("month") < 10 ? "0" : ""
					}${paidPayment.get("month")}`
				] = true;
			}
			const allInstallmentsPaid = Object.keys(expectedPeriods).every(
				(period) => paidPeriods[period],
			);
			if (allInstallmentsPaid && !debt.getString("completed_at")) {
				debt.set("completed_at", payment.getString("paid_date").slice(0, 10));
				txApp.save(debt);
			}

			savedPayment = payment;
			savedDebt = debt;
		});

		return e.json(200, { payment: savedPayment, debt: savedDebt });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"POST",
	"/api/debt-detox/payments/{id}/unmark",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const paymentId = e.request.pathValue("id");
		let savedPayment = null;
		let savedDebt = null;

		e.app.runInTransaction((txApp) => {
			const payment = txApp.findRecordById("payments", paymentId);
			const debt = txApp.findRecordById("debts", payment.get("debt_id"));
			if (
				!collaboration.isMember(debt, e.auth.id) ||
				payment.getString("deleted") ||
				payment.get("is_extra_payment")
			) {
				throw new NotFoundError("Payment not found");
			}

			payment.set("paid", false);
			payment.set("paid_date", null);
			payment.set("actual_amount", null);
			collaboration.stamp(payment, debt, e.auth);
			txApp.save(payment);
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"payment_unmarked",
				{ year: payment.get("year"), month: payment.get("month") },
			);

			// An unpaid installment means the debt is no longer complete.
			if (debt.getString("completed_at")) {
				debt.set("completed_at", null);
				txApp.save(debt);
			}

			savedPayment = payment;
			savedDebt = debt;
		});

		return e.json(200, { payment: savedPayment, debt: savedDebt });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"POST",
	"/api/debt-detox/payments/{id}/reactivate",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const dates = require(`${__hooks}/lib/dates.js`);
		const { addMonthsToDateOnly } = dates;

		const paymentId = e.request.pathValue("id");
		let savedPayment = null;
		let savedDebt = null;
		e.app.runInTransaction((txApp) => {
			const payment = txApp.findRecordById("payments", paymentId);
			const debt = txApp.findRecordById("debts", payment.get("debt_id"));
			if (
				!collaboration.isMember(debt, e.auth.id) ||
				payment.getString("deleted") ||
				payment.get("is_extra_payment")
			) {
				throw new NotFoundError("Payment not found");
			}

			payment.set("paid", false);
			payment.set("paid_date", null);
			payment.set("actual_amount", null);
			collaboration.stamp(payment, debt, e.auth);
			txApp.save(payment);
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"debt_reactivated",
				{ year: payment.get("year"), month: payment.get("month") },
			);

			// A separate final payment stays due at the original contract end;
			// otherwise the plan ends with the current last installment, which
			// extra payments may have moved earlier.
			const hasFinalPayment = (debt.get("final_payment") || 0) > 0;
			const paymentCount = hasFinalPayment
				? debt.get("original_number_of_payments") ||
					debt.get("number_of_payments")
				: debt.get("number_of_payments");
			const finalMonthOffset = paymentCount - 1 + (hasFinalPayment ? 1 : 0);
			debt.set(
				"final_payment_date",
				addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					Math.max(finalMonthOffset, 0),
				),
			);
			debt.set("completed_at", null);
			txApp.save(debt);

			savedPayment = payment;
			savedDebt = debt;
		});

		return e.json(200, { payment: savedPayment, debt: savedDebt });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"PATCH",
	"/api/debt-detox/payments/{id}/amount",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const data = new DynamicModel({ amount: -0 });
		e.bindBody(data);
		if (data.amount <= 0) {
			throw new BadRequestError("Amount must be greater than zero");
		}

		const paymentId = e.request.pathValue("id");
		let savedPayment = null;
		e.app.runInTransaction((txApp) => {
			const payment = txApp.findRecordById("payments", paymentId);
			const debt = txApp.findRecordById("debts", payment.get("debt_id"));
			if (
				!collaboration.isMember(debt, e.auth.id) ||
				payment.getString("deleted") ||
				!payment.get("paid") ||
				(payment.get("is_extra_payment") &&
					debt.getString("user_id") !== e.auth.id)
			) {
				throw new NotFoundError("Payment not found");
			}

			payment.set("actual_amount", data.amount);
			collaboration.stamp(payment, debt, e.auth);
			txApp.save(payment);
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"amount_changed",
				{
					year: payment.get("year"),
					month: payment.get("month"),
					amount: data.amount,
				},
			);
			savedPayment = payment;
		});

		return e.json(200, { payment: savedPayment });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"DELETE",
	"/api/debt-detox/payments/{id}/extra",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const paymentId = e.request.pathValue("id");
		let deletedAt = "";

		e.app.runInTransaction((txApp) => {
			const payment = txApp.findRecordById("payments", paymentId);
			const debt = txApp.findRecordById("debts", payment.get("debt_id"));
			if (
				debt.get("user_id") !== e.auth.id ||
				!payment.get("is_extra_payment")
			) {
				throw new NotFoundError("Extra payment not found");
			}

			deletedAt = payment.getString("deleted");
			if (!deletedAt) {
				const snapshot = JSON.parse(
					payment.getString("strategy_snapshot") || "null",
				);
				if (snapshot) {
					// Later strategies were computed on top of this one, so they
					// must be undone first to restore a consistent plan.
					const laterStrategies = txApp.findRecordsByFilter(
						"payments",
						"debt_id = {:debt} && is_extra_payment = true && deleted = null && strategy_snapshot != null && id != {:id} && created > {:created}",
						"",
						1,
						0,
						{
							debt: debt.id,
							id: payment.id,
							created: payment.getString("created"),
						},
					);
					if (laterStrategies.length > 0) {
						throw new BadRequestError(
							"Delete newer extra payments that changed the plan first",
						);
					}
					debt.set("monthly_amount", snapshot.monthly_amount);
					debt.set("number_of_payments", snapshot.number_of_payments);
					debt.set("final_payment_date", snapshot.final_payment_date);
					txApp.save(debt);
				}

				deletedAt = new Date().toISOString().replace("T", " ");
				payment.set("deleted", deletedAt);
				collaboration.stamp(payment, debt, e.auth);
				txApp.save(payment);
				collaboration.log(
					txApp,
					debt,
					e.auth,
					"extra_deleted",
					{ amount: payment.get("actual_amount") },
				);
			}
		});

		return e.json(200, { deleted: true, deletedAt });
	},
	$apis.requireAuth("users"),
);
