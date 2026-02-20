import type { PaymentStats } from "@/data/debtDetail";
import type { Debt, Payment } from "@/lib/types";

/**
 * Calcula cuántas cuotas mensuales han transcurrido desde la primera fecha de pago
 * hasta hoy, respetando el día exacto del mes. Retorna un valor entre 0 y numberOfPayments.
 */
export function calculateElapsedPayments(
	firstPaymentDate: string,
	numberOfPayments: number,
	now: Date = new Date(),
): number {
	const firstPayment = new Date(firstPaymentDate);

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

	if (currentDate.getDate() < startDate.getDate()) {
		monthsElapsed--;
	}

	monthsElapsed = Math.max(0, monthsElapsed + 1);

	return Math.min(monthsElapsed, numberOfPayments);
}

export function calculateExpectedPaidPayments(debt: Debt): number {
	if (typeof window === "undefined") return 0;

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
		.reduce((sum, p) => sum + (p.actual_amount || p.planned_amount), 0);

	const effectivePaidPayments = Math.max(
		registeredPaidPayments,
		expectedPaidPayments,
	);

	const estimatedPaidAmount =
		(debt.down_payment || 0) +
		Math.max(registeredPaidPayments, expectedPaidPayments) *
			debt.monthly_amount;

	const totalAmount =
		(debt.down_payment || 0) +
		debt.monthly_amount * debt.number_of_payments +
		(debt.final_payment || 0);

	// El importe pagado nunca puede exceder el total de la deuda
	const effectivePaidAmount = Math.min(
		Math.max(
			(debt.down_payment || 0) + totalRegisteredAmount,
			estimatedPaidAmount,
		),
		totalAmount,
	);

	return {
		registeredPaidPayments,
		expectedPaidPayments,
		effectivePaidPayments,
		effectivePaidAmount,
		totalRegisteredAmount,
		pendingPayments: debt.number_of_payments - effectivePaidPayments,
		pendingAmount: Math.max(0, totalAmount - effectivePaidAmount),
	};
}
