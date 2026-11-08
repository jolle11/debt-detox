import type { PaymentStats } from "@/data/debtDetail";
import { parseDateOnly } from "@/lib/dateOnly";
import type { Debt, Payment } from "@/lib/types";

export function hasParticipants(debt: Debt): boolean {
	return (debt.participants?.length ?? 0) > 1;
}

export function isSplitDebt(debt: Debt): boolean {
	return Boolean(debt.is_shared || hasParticipants(debt));
}

/** The user's part of the debt's totals; only a defined split reduces them. */
export function debtShare(debt: Debt): number {
	return hasParticipants(debt) ? (debt.my_percent ?? 100) / 100 : 1;
}

/** The user's part of the installment. Shared debts without a split pay half. */
export function monthlyShare(debt: Debt): number {
	if (debt.my_percent !== undefined) return debt.my_percent / 100;
	return isSplitDebt(debt) ? 0.5 : 1;
}

export function calculateMonthlyContribution(debt: Debt): number {
	return debt.monthly_amount * monthlyShare(debt);
}

/** The user's part of a payment, using the split in force when it was made. */
export function paymentShare(payment: Payment, debt: Debt): number {
	return payment.my_percent !== undefined
		? payment.my_percent / 100
		: debtShare(debt);
}

/** Percentages proportional to incomes, with two decimals, adding up to 100. */
export function percentagesFromIncomes(incomes: number[]): number[] | null {
	const total = incomes.reduce((sum, income) => sum + income, 0);
	if (incomes.length === 0 || incomes.some((income) => !(income > 0)))
		return null;
	const percents = incomes.map(
		(income) => Math.round((income / total) * 10000) / 100,
	);
	const drift = 100 - percents.reduce((sum, percent) => sum + percent, 0);
	const largest = percents.indexOf(Math.max(...percents));
	percents[largest] = Math.round((percents[largest] + drift) * 100) / 100;
	return percents;
}

export function otherParticipantNames(
	debt: Debt,
	userId: string | undefined,
	fallback: string,
): string {
	return (debt.participants ?? [])
		.filter((person) => !person.user_id || person.user_id !== userId)
		.map((person) => person.name || fallback)
		.join(", ");
}

/**
 * Calcula cuántas cuotas mensuales han transcurrido desde la primera fecha de pago
 * hasta hoy, respetando el día exacto del mes. Retorna un valor entre 0 y numberOfPayments.
 */
export function calculateElapsedPayments(
	firstPaymentDate: string,
	numberOfPayments: number,
	now: Date = new Date(),
): number {
	const firstPayment = parseDateOnly(firstPaymentDate);
	if (!firstPayment) return 0;

	if (now < firstPayment) return 0;

	const currentDate = new Date(
		now.getFullYear(),
		now.getMonth(),
		now.getDate(),
	);
	const startDate = new Date(
		firstPayment.getFullYear(),
		firstPayment.getMonth(),
		firstPayment.getDate(),
	);

	const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
	const monthsDiff = currentDate.getMonth() - startDate.getMonth();
	let monthsElapsed = yearsDiff * 12 + monthsDiff;

	// Solo contar un mes como pagado si ya pasó su día de pago (no el mismo día).
	// En meses más cortos, la cuota del día 29-31 vence el último día del mes.
	const daysInCurrentMonth = new Date(
		currentDate.getFullYear(),
		currentDate.getMonth() + 1,
		0,
	).getDate();
	const dueDay = Math.min(startDate.getDate(), daysInCurrentMonth);
	if (currentDate.getDate() <= dueDay) {
		monthsElapsed--;
	}

	monthsElapsed = Math.max(0, monthsElapsed);

	return Math.min(monthsElapsed, numberOfPayments);
}

export function calculateExpectedPaidPayments(debt: Debt): number {
	return calculateElapsedPayments(
		debt.first_payment_date,
		debt.number_of_payments,
	);
}

export function calculatePaymentStats(
	debt: Debt,
	payments: Payment[],
): PaymentStats {
	// Solo contar cuotas mensuales, no pagos extras
	const registeredPaidPayments = payments.filter(
		(p) => p.paid && !p.is_extra_payment,
	).length;
	const expectedPaidPayments = calculateExpectedPaidPayments(debt);
	// El total incluye todos los pagos (cuotas + extras)
	const totalRegisteredAmount = payments
		.filter((p) => p.paid)
		// PocketBase returns 0 for empty numbers and paid amounts are always > 0.
		.reduce((sum, p) => sum + (p.actual_amount || p.planned_amount), 0);

	const effectivePaidPayments = Math.min(
		Math.max(registeredPaidPayments, expectedPaidPayments),
		debt.number_of_payments,
	);

	// Usar valores originales para cálculos de total real de la deuda
	const originalMonthly = debt.original_monthly_amount || debt.monthly_amount;
	const originalPayments =
		debt.original_number_of_payments || debt.number_of_payments;

	const totalAmount =
		(debt.down_payment || 0) +
		originalMonthly * originalPayments +
		(debt.final_payment || 0);

	// Lo registrado cuenta por su importe real; las cuotas vencidas sin registrar
	// se estiman con la cuota actual del plan.
	const unregisteredElapsedPayments = Math.max(
		0,
		expectedPaidPayments - registeredPaidPayments,
	);

	// El importe pagado nunca puede exceder el total de la deuda
	const effectivePaidAmount = Math.min(
		(debt.down_payment || 0) +
			totalRegisteredAmount +
			unregisteredElapsedPayments * debt.monthly_amount,
		totalAmount,
	);

	return {
		registeredPaidPayments,
		expectedPaidPayments,
		effectivePaidPayments,
		effectivePaidAmount,
		totalRegisteredAmount,
		pendingPayments: Math.max(
			0,
			debt.number_of_payments - effectivePaidPayments,
		),
		pendingAmount: Math.max(0, totalAmount - effectivePaidAmount),
	};
}
