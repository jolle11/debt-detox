interface DebtDateInput {
	first_payment_date: string;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date?: string;
}

function toDateOnlyString(date: Date): string {
	return date.toISOString().split("T")[0];
}

export function calculateLastMonthlyPaymentDate(
	firstPaymentDate: string,
	numberOfPayments: number,
): string {
	const date = new Date(firstPaymentDate);
	date.setMonth(date.getMonth() + Math.max(numberOfPayments - 1, 0));
	return toDateOnlyString(date);
}

export function resolveFinalPaymentDate({
	first_payment_date,
	number_of_payments,
	final_payment,
	final_payment_date,
}: DebtDateInput): string {
	const hasFinalPayment = (final_payment ?? 0) > 0;
	const lastMonthlyPaymentDate = new Date(
		calculateLastMonthlyPaymentDate(first_payment_date, number_of_payments),
	);

	if (final_payment_date) {
		const providedDate = new Date(final_payment_date);
		if (
			!Number.isNaN(providedDate.getTime()) &&
			(!hasFinalPayment || providedDate > lastMonthlyPaymentDate)
		) {
			return final_payment_date;
		}
	}

	const resolvedDate = new Date(first_payment_date);
	const monthOffset = number_of_payments - 1 + (hasFinalPayment ? 1 : 0);
	resolvedDate.setMonth(resolvedDate.getMonth() + Math.max(monthOffset, 0));

	return toDateOnlyString(resolvedDate);
}
