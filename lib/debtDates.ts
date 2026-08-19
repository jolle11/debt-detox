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

interface PaymentCountInput {
	first_payment_date: string;
	final_payment_date: string;
	final_payment?: number;
}

export function calculateNumberOfPayments({
	first_payment_date,
	final_payment_date,
	final_payment,
}: PaymentCountInput): number {
	const firstPaymentDate = normalizeDateOnlyString(first_payment_date);
	const finalPaymentDate = normalizeDateOnlyString(final_payment_date);

	if (!firstPaymentDate || !finalPaymentDate) {
		throw new Error("Invalid payment date");
	}
	if (compareDateOnlyStrings(finalPaymentDate, firstPaymentDate) < 0) {
		throw new Error("Final payment date must follow first payment date");
	}

	const firstYear = Number.parseInt(firstPaymentDate.slice(0, 4), 10);
	const firstMonth = Number.parseInt(firstPaymentDate.slice(5, 7), 10);
	const finalYear = Number.parseInt(finalPaymentDate.slice(0, 4), 10);
	const finalMonth = Number.parseInt(finalPaymentDate.slice(5, 7), 10);
	const monthDifference =
		(finalYear - firstYear) * 12 + (finalMonth - firstMonth);
	const numberOfPayments = monthDifference + ((final_payment ?? 0) > 0 ? 0 : 1);

	if (numberOfPayments < 1) {
		throw new Error("Final payment date must follow first payment date");
	}

	return numberOfPayments;
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
