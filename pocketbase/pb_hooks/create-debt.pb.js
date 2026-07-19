routerAdd(
	"POST",
	"/api/debt-detox/debts",
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

		let savedDebt = null;
		e.app.runInTransaction((txApp) => {
			const debts = txApp.findCollectionByNameOrId("debts");
			const debt = new Record(debts);
			debt.set("user_id", e.auth.id);
			debt.set("name", data.name.trim());
			debt.set("entity", data.entity.trim());
			debt.set("down_payment", data.down_payment);
			debt.set("first_payment_date", data.first_payment_date);
			debt.set("monthly_amount", data.monthly_amount);
			debt.set("number_of_payments", data.number_of_payments);
			debt.set("original_monthly_amount", data.monthly_amount);
			debt.set("original_number_of_payments", data.number_of_payments);
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

			txApp.save(debt);
			savedDebt = debt;
		});

		const currentPeriod = new Date().toISOString().slice(0, 7);
		let historicalCount = 0;
		for (let offset = 0; offset < data.number_of_payments; offset += 1) {
			const period = addMonthsToDateOnly(data.first_payment_date, offset).slice(
				0,
				7,
			);
			if (period >= currentPeriod) break;
			historicalCount += 1;
		}

		return e.json(200, {
			debt: savedDebt,
			historicalInfo:
				historicalCount > 0
					? {
							debtId: savedDebt.id,
							count: historicalCount,
							monthlyAmount: savedDebt.get("monthly_amount"),
							firstPaymentDate: savedDebt.getString("first_payment_date"),
							numberOfPayments: savedDebt.get("number_of_payments"),
						}
					: null,
		});
	},
	$apis.requireAuth("users"),
);
