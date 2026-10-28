routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/extra-payment",
	(e) => {
		const collaboration = require(`${__hooks}/lib/collaboration.js`);
		const dates = require(`${__hooks}/lib/dates.js`);

		const data = new DynamicModel({
			amount: -0,
			strategy: "none",
		});
		e.bindBody(data);

		if (data.amount <= 0) {
			throw new BadRequestError("Amount must be greater than zero");
		}
		if (
			!["none", "reduce_amount", "reduce_installments"].includes(data.strategy)
		) {
			throw new BadRequestError("Invalid extra payment strategy");
		}

		const debtId = e.request.pathValue("id");
		let savedPayment = null;
		let savedDebt = null;

		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}

			const today = dates.today(e);
			const payments = txApp.findCollectionByNameOrId("payments");
			const payment = new Record(payments);
			payment.set("debt_id", debt.id);
			payment.set("month", parseInt(today.slice(5, 7), 10));
			payment.set("year", parseInt(today.slice(0, 4), 10));
			payment.set("planned_amount", 0);
			payment.set("actual_amount", data.amount);
			payment.set("paid", true);
			payment.set("paid_date", today);
			payment.set("is_extra_payment", true);

			if (data.strategy !== "none") {
				const debtPayments = txApp.findRecordsByFilter(
					"payments",
					"debt_id = {:debt} && deleted = null && paid = true",
					"",
					0,
					0,
					{ debt: debt.id },
				);
				const paidFromPayments = debtPayments.reduce(
					(total, item) =>
						total + (item.get("actual_amount") || item.get("planned_amount")),
					0,
				);
				const originalMonthly =
					debt.get("original_monthly_amount") || debt.get("monthly_amount");
				const originalPayments =
					debt.get("original_number_of_payments") ||
					debt.get("number_of_payments");
				const finalAmount = debt.get("final_payment") || 0;
				const finalPeriod = dates.finalPaymentDate(debt).slice(0, 7);
				const isFinalPayment = (item) =>
					!item.get("is_extra_payment") &&
					finalPeriod !== "" &&
					dates.periodOf(item.get("year"), item.get("month")) === finalPeriod;
				const finalPaid = debtPayments.some(isFinalPayment);
				// The separate final payment keeps its own amount, so only the
				// balance owed through monthly installments is redistributed.
				const remainingInstallmentBalance = Math.max(
					0,
					originalMonthly * originalPayments +
						finalAmount -
						paidFromPayments -
						data.amount -
						(finalPaid ? 0 : finalAmount),
				);
				const paidInstallments = debtPayments.filter(
					(item) => !item.get("is_extra_payment") && !isFinalPayment(item),
				).length;

				payment.set("strategy_snapshot", {
					strategy: data.strategy,
					monthly_amount: debt.get("monthly_amount"),
					number_of_payments: debt.get("number_of_payments"),
					final_payment_date: debt.getString("final_payment_date"),
				});

				if (!debt.get("original_monthly_amount")) {
					debt.set("original_monthly_amount", debt.get("monthly_amount"));
				}
				if (!debt.get("original_number_of_payments")) {
					debt.set(
						"original_number_of_payments",
						debt.get("number_of_payments"),
					);
				}

				if (data.strategy === "reduce_amount") {
					const remainingInstallments =
						debt.get("number_of_payments") - paidInstallments;
					if (remainingInstallments > 0) {
						debt.set(
							"monthly_amount",
							Math.round(
								(remainingInstallmentBalance / remainingInstallments) * 100,
							) / 100,
						);
					}
				}

				if (data.strategy === "reduce_installments") {
					const monthlyAmount = debt.get("monthly_amount");
					if (monthlyAmount > 0) {
						const newRemainingInstallments = Math.ceil(
							Math.round((remainingInstallmentBalance / monthlyAmount) * 100) /
								100,
						);
						const newNumberOfPayments = Math.max(
							paidInstallments + newRemainingInstallments,
							1,
						);
						debt.set("number_of_payments", newNumberOfPayments);
						const finalMonthOffset =
							newNumberOfPayments - 1 + (finalAmount > 0 ? 1 : 0);
						debt.set(
							"final_payment_date",
							dates.addMonthsToDateOnly(
								debt.getString("first_payment_date"),
								Math.max(finalMonthOffset, 0),
							),
						);
					}
				}

				txApp.save(debt);
			}

			collaboration.stamp(payment, debt, e.auth);
			txApp.save(payment);
			collaboration.log(
				txApp,
				debt,
				e.auth,
				"extra_added",
				{ amount: data.amount },
			);

			savedPayment = payment;
			savedDebt = debt;
		});

		return e.json(200, {
			payment: savedPayment,
			debt: savedDebt,
		});
	},
	$apis.requireAuth("users"),
);
