routerAdd(
	"POST",
	"/api/debt-detox/debts/{id}/extra-payment",
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

		const data = new DynamicModel({
			amount: 0,
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

			const now = new Date();
			const payments = txApp.findCollectionByNameOrId("payments");
			const payment = new Record(payments);
			payment.set("debt_id", debt.id);
			payment.set("month", now.getUTCMonth() + 1);
			payment.set("year", now.getUTCFullYear());
			payment.set("planned_amount", 0);
			payment.set("actual_amount", data.amount);
			payment.set("paid", true);
			payment.set("paid_date", now.toISOString());
			payment.set("is_extra_payment", true);
			txApp.save(payment);

			if (data.strategy !== "none") {
				const debtPayments = txApp.findRecordsByFilter(
					"payments",
					`debt_id = "${debt.id}" && deleted = null && paid = true`,
					"",
					0,
					0,
				);
				const paidFromPayments = debtPayments.reduce(
					(total, item) =>
						total + (item.get("actual_amount") || item.get("planned_amount")),
					0,
				);
				const downPayment = debt.get("down_payment") || 0;
				const originalMonthly =
					debt.get("original_monthly_amount") || debt.get("monthly_amount");
				const originalPayments =
					debt.get("original_number_of_payments") ||
					debt.get("number_of_payments");
				const totalDebt =
					downPayment * 1 +
					originalMonthly * originalPayments +
					(debt.get("final_payment") || 0);
				const remainingBalance = Math.max(
					0,
					totalDebt - downPayment - paidFromPayments,
				);
				const paidInstallments = debtPayments.filter(
					(item) => !item.get("is_extra_payment"),
				).length;

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
							Math.round((remainingBalance / remainingInstallments) * 100) /
								100,
						);
					}
				}

				if (data.strategy === "reduce_installments") {
					const monthlyAmount = debt.get("monthly_amount");
					if (monthlyAmount > 0) {
						const newRemainingInstallments = Math.ceil(
							remainingBalance / monthlyAmount,
						);
						const newNumberOfPayments =
							paidInstallments + newRemainingInstallments;
						debt.set("number_of_payments", newNumberOfPayments);
						const hasFinalPayment = (debt.get("final_payment") || 0) > 0;
						const finalMonthOffset =
							newNumberOfPayments - 1 + (hasFinalPayment ? 1 : 0);
						const finalPaymentDate = addMonthsToDateOnly(
							debt.getString("first_payment_date"),
							Math.max(finalMonthOffset, 0),
						);
						debt.set("final_payment_date", finalPaymentDate);
					}
				}

				txApp.save(debt);
			}

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
