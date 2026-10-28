import type { PaymentStats } from "@/data/debtDetail";
import { parseDateOnly } from "@/lib/dateOnly";
import type { Debt, Payment } from "@/lib/types";

export function isSplitDebt(debt: Debt): boolean {
	return Boolean(debt.is_shared || debt.collaborator_id);
}

// The user's half of the installment when the debt is split with someone.
export function calculateMonthlyContribution(debt: Debt): number {
	return debt.monthly_amount * (isSplitDebt(debt) ? 0.5 : 1);
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
