routerAdd(
	"PATCH",
	"/api/debt-detox/debts/{id}",
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
			name: "",
			entity: "",
			down_payment: -0,
			first_payment_date: "",
			monthly_amount: -0,
			number_of_payments: 0,
			final_payment: -0,
			final_payment_date: "",
		});
		e.bindBody(data);

		if (!data.name.trim() || !data.entity.trim()) {
			throw new BadRequestError("Name and entity are required");
		}
		if (data.monthly_amount <= 0 || data.number_of_payments < 1) {
			throw new BadRequestError("Invalid payment plan");
		}

		const debtId = e.request.pathValue("id");
		let savedDebt = null;
		e.app.runInTransaction((txApp) => {
			const debt = txApp.findRecordById("debts", debtId);
			if (debt.get("user_id") !== e.auth.id) {
				throw new NotFoundError("Debt not found");
			}
			if (!debt.get("original_monthly_amount")) {
				debt.set("original_monthly_amount", debt.get("monthly_amount"));
			}
			if (!debt.get("original_number_of_payments")) {
				debt.set("original_number_of_payments", debt.get("number_of_payments"));
			}

			debt.set("name", data.name.trim());
			debt.set("entity", data.entity.trim());
			debt.set("down_payment", data.down_payment);
			debt.set("first_payment_date", data.first_payment_date);
			debt.set("monthly_amount", data.monthly_amount);
			debt.set("number_of_payments", data.number_of_payments);
			debt.set("final_payment", data.final_payment);

			const lastMonthlyDate = addMonthsToDateOnly(
				data.first_payment_date,
				Math.max(data.number_of_payments - 1, 0),
			);
			const configuredFinalDate = String(data.final_payment_date).slice(0, 10);
			const hasSeparateFinalPayment = data.final_payment > 0;
			const finalPaymentDate =
				configuredFinalDate &&
				(!hasSeparateFinalPayment || configuredFinalDate > lastMonthlyDate)
					? configuredFinalDate
					: addMonthsToDateOnly(
							data.first_payment_date,
							Math.max(
								data.number_of_payments - 1 + (hasSeparateFinalPayment ? 1 : 0),
								0,
							),
						);
			debt.set("final_payment_date", finalPaymentDate);

			const expectedAmounts = {};
			for (let offset = 0; offset < data.number_of_payments; offset += 1) {
				const paymentDate = addMonthsToDateOnly(
					data.first_payment_date,
					offset,
				);
				expectedAmounts[paymentDate.slice(0, 7)] = data.monthly_amount;
			}
			if (hasSeparateFinalPayment) {
				expectedAmounts[finalPaymentDate.slice(0, 7)] = data.final_payment;
			}

			const existingPayments = txApp.findRecordsByFilter(
				"payments",
				`debt_id = "${debt.id}" && deleted = null`,
				"",
				0,
				0,
			);
			const deletedAt = new Date().toISOString();
			for (const payment of existingPayments) {
				if (payment.get("is_extra_payment") || payment.get("paid")) {
					continue;
				}

				const month = payment.get("month");
				const monthValue = month < 10 ? `0${month}` : String(month);
				const period = `${payment.get("year")}-${monthValue}`;
				if (expectedAmounts[period] !== undefined) {
					payment.set("planned_amount", expectedAmounts[period]);
				} else {
					payment.set("deleted", deletedAt);
				}
				txApp.save(payment);
			}

			txApp.save(debt);
			savedDebt = debt;
		});

		return e.json(200, { debt: savedDebt });
	},
	$apis.requireAuth("users"),
);
