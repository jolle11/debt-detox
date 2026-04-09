import {
	addMonthsToDateOnly,
	compareDateOnlyStrings,
	normalizeDateOnlyString,
} from "./dateOnly";

interface DebtDateInput {
	first_payment_date: string;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date?: string;
}

export function calculateLastMonthlyPaymentDate(
	firstPaymentDate: string,
	numberOfPayments: number,
): string {
	return addMonthsToDateOnly(
		firstPaymentDate,
		Math.max(numberOfPayments - 1, 0),
	);
}

export function resolveFinalPaymentDate({
	first_payment_date,
	number_of_payments,
	final_payment,
	final_payment_date,
}: DebtDateInput): string {
	const hasFinalPayment = (final_payment ?? 0) > 0;
	const lastMonthlyPaymentDate = calculateLastMonthlyPaymentDate(
		first_payment_date,
		number_of_payments,
	);

	if (final_payment_date) {
		const providedDate = normalizeDateOnlyString(final_payment_date);
		if (
			providedDate &&
			(!hasFinalPayment ||
				compareDateOnlyStrings(providedDate, lastMonthlyPaymentDate) > 0)
		) {
			return providedDate;
		}
	}

	const monthOffset = number_of_payments - 1 + (hasFinalPayment ? 1 : 0);
	return addMonthsToDateOnly(first_payment_date, Math.max(monthOffset, 0));
}
