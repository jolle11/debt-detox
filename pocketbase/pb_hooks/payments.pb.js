routerAdd(
	"PUT",
	"/api/debt-detox/debts/{id}/payments/{year}/{month}",
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
		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}

			const requestedPeriod = `${year}-${month < 10 ? `0${month}` : month}`;
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

			if (plannedAmount === null && (debt.get("final_payment") || 0) > 0) {
				const lastMonthlyDate = addMonthsToDateOnly(
					debt.getString("first_payment_date"),
					Math.max(debt.get("number_of_payments") - 1, 0),
				);
				const configuredFinalDate = debt
					.getString("final_payment_date")
					.slice(0, 10);
				const finalPaymentDate =
					configuredFinalDate > lastMonthlyDate
						? configuredFinalDate
						: addMonthsToDateOnly(
								debt.getString("first_payment_date"),
								debt.get("number_of_payments"),
							);
				if (finalPaymentDate.slice(0, 7) === requestedPeriod) {
					plannedAmount = debt.get("final_payment");
				}
			}

			if (plannedAmount === null) {
				throw new BadRequestError("Payment period is outside the debt plan");
			}

			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				`debt_id = "${debt.id}" && year = ${year} && month = ${month} && is_extra_payment = false`,
				"",
				0,
				0,
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

			payment.set("deleted", null);
			payment.set("planned_amount", plannedAmount);
			payment.set(
				"actual_amount",
				data.actual_amount > 0 ? data.actual_amount : plannedAmount,
			);
			payment.set("paid", true);
			payment.set(
				"paid_date",
				data.paid_date || new Date().toISOString().slice(0, 10),
			);
			txApp.save(payment);
			savedPayment = payment;
		});

		return e.json(200, { payment: savedPayment });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"POST",
	"/api/debt-detox/payments/{id}/unmark",
	(e) => {
		const paymentId = e.request.pathValue("id");
		let savedPayment = null;

		e.app.runInTransaction((txApp) => {
			const payment = txApp.findRecordById("payments", paymentId);
			const debt = txApp.findRecordById("debts", payment.get("debt_id"));
			if (
				debt.get("user_id") !== e.auth.id ||
				payment.get("is_extra_payment")
			) {
				throw new NotFoundError("Payment not found");
			}

			payment.set("paid", false);
			payment.set("paid_date", null);
			payment.set("actual_amount", null);
			txApp.save(payment);
			savedPayment = payment;
		});

		return e.json(200, { payment: savedPayment });
	},
	$apis.requireAuth("users"),
);

routerAdd(
	"PATCH",
	"/api/debt-detox/payments/{id}/amount",
	(e) => {
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
				debt.get("user_id") !== e.auth.id ||
				payment.getString("deleted") ||
				!payment.get("paid")
			) {
				throw new NotFoundError("Payment not found");
			}

			payment.set("actual_amount", data.amount);
			txApp.save(payment);
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
				deletedAt = new Date().toISOString().replace("T", " ");
				payment.set("deleted", deletedAt);
				txApp.save(payment);
			}
		});

		return e.json(200, { deleted: true, deletedAt });
	},
	$apis.requireAuth("users"),
);
