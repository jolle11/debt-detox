import { getCurrencySymbol } from "./currencies";

export function formatNumber(
	value: number,
	decimals: number = 2,
	locale: string = "es-ES",
): string {
	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

export function formatCurrency(
	value: number,
	userCurrency?: string,
	locale: string = "es-ES",
): string {
	const decimals = value % 1 === 0 ? 0 : 2;
	const formatted = formatNumber(value, decimals, locale);
	const currencySymbol = userCurrency ? getCurrencySymbol(userCurrency) : "€";
	return `${formatted} ${currencySymbol}`;
}

export function formatInteger(value: number, locale: string = "es-ES"): string {
	return formatNumber(value, 0, locale);
}

import type { Payment } from "./types";
import { calculateElapsedPayments } from "@/utils/debtCalculations";

// Nuevo modelo de cálculos basado en cuotas y fechas específicas

export function calculateDebtStatus(
	finalPaymentDate: string | undefined,
): "active" | "completed" {
	if (!finalPaymentDate) {
		return "active";
	}
	const now = new Date();
	const finalDate = new Date(finalPaymentDate);
	return finalDate <= now ? "completed" : "active";
}

export function calculateTotalAmount(debt: {
	down_payment?: number;
	monthly_amount: number;
	number_of_payments: number;
	final_payment?: number;
}): number {
	const downPayment = debt.down_payment || 0;
	const monthlyTotal = debt.monthly_amount * debt.number_of_payments;
	const finalPayment = debt.final_payment || 0;

	return downPayment + monthlyTotal + finalPayment;
}

export function calculatePaidAmount(debt: {
	down_payment?: number;
	first_payment_date: string;
	monthly_amount: number;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date?: string;
}): number {
	const now = new Date();
	const firstPayment = new Date(debt.first_payment_date);

	// If no final payment date, calculate it
	const finalPaymentDate =
		debt.final_payment_date ||
		(() => {
			const calculatedDate = new Date(firstPayment);
			calculatedDate.setMonth(
				calculatedDate.getMonth() + debt.number_of_payments - 1,
			);
			return calculatedDate.toISOString().split("T")[0];
		})();
	const finalPayment = new Date(finalPaymentDate);

	let paidAmount = debt.down_payment || 0; // Entrada siempre está pagada

	if (now < firstPayment) {
		// Aún no ha empezado a pagar cuotas
		return paidAmount;
	}

	if (now >= finalPayment) {
		// Ya terminó todo
		return calculateTotalAmount(debt);
	}

	const paidMonthlyPayments = calculateElapsedPayments(
		debt.first_payment_date,
		debt.number_of_payments,
		now,
	);
	paidAmount += paidMonthlyPayments * debt.monthly_amount;

	// Si ya llegó la fecha de la cuota final, agregarla
	if (now >= finalPayment && debt.final_payment) {
		paidAmount += debt.final_payment;
	}

	return paidAmount;
}

// Nueva función que combina estimación por fechas con pagos registrados
export function calculatePaidAmountWithPayments(
	debt: {
		down_payment?: number;
		first_payment_date: string;
		monthly_amount: number;
		number_of_payments: number;
		final_payment?: number;
		final_payment_date?: string;
	},
	payments: Payment[] = [],
): number {
	let paidAmount = debt.down_payment || 0; // Entrada siempre está pagada

	// Calcular monto pagado solo de pagos registrados explícitamente
	let monthlyPaidAmount = 0;
	payments.forEach((payment) => {
		if (payment.paid) {
			monthlyPaidAmount +=
				payment.actual_amount || payment.planned_amount;
		}
	});

	paidAmount += monthlyPaidAmount;

	// Agregar pago final si corresponde
	const now = new Date();
	if (debt.final_payment_date) {
		const finalPayment = new Date(debt.final_payment_date);
		if (now >= finalPayment && debt.final_payment) {
			paidAmount += debt.final_payment;
		}
	}

	// El importe pagado nunca puede exceder el total de la deuda
	const totalAmount = calculateTotalAmount(debt);
	return Math.min(paidAmount, totalAmount);
}

export function calculateRemainingAmount(debt: {
	down_payment?: number;
	first_payment_date: string;
	monthly_amount: number;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date?: string;
}): number {
	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmount(debt);

	return Math.max(0, totalAmount - paidAmount);
}

export function calculatePaymentProgress(debt: {
	down_payment?: number;
	first_payment_date: string;
	monthly_amount: number;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date?: string;
}): {
	percentage: number;
	paidPayments: number;
	totalPayments: number;
} {
	const now = new Date();
	const firstPayment = new Date(debt.first_payment_date);

	// If no final payment date, calculate it
	const finalPaymentDate =
		debt.final_payment_date ||
		(() => {
			const calculatedDate = new Date(firstPayment);
			calculatedDate.setMonth(
				calculatedDate.getMonth() + debt.number_of_payments - 1,
			);
			return calculatedDate.toISOString().split("T")[0];
		})();
	const finalPayment = new Date(finalPaymentDate);

	// Contar pagos totales (cuotas mensuales + cuota final si existe)
	let totalPayments = debt.number_of_payments;
	if (debt.final_payment && debt.final_payment > 0) {
		totalPayments += 1;
	}

	let paidPayments = 0;

	if (now < firstPayment) {
		// Aún no empezó
		const totalAmount = calculateTotalAmount(debt);
		const percentage = debt.down_payment
			? Math.round((debt.down_payment / totalAmount) * 100)
			: 0;
		return { percentage, paidPayments: 0, totalPayments };
	}

	if (now >= finalPayment) {
		// Ya terminó todo
		return { percentage: 100, paidPayments: totalPayments, totalPayments };
	}

	paidPayments = calculateElapsedPayments(
		debt.first_payment_date,
		debt.number_of_payments,
		now,
	);

	// Si ya llegó la fecha final, agregar esa cuota
	if (now >= finalPayment && debt.final_payment) {
		paidPayments += 1;
	}

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmount(debt);
	const percentage = Math.round((paidAmount / totalAmount) * 100);

	return { percentage, paidPayments, totalPayments };
}

// Nueva función que combina estimación por fechas con pagos registrados
export function calculatePaymentProgressWithPayments(
	debt: {
		down_payment?: number;
		first_payment_date: string;
		monthly_amount: number;
		number_of_payments: number;
		final_payment?: number;
		final_payment_date?: string;
	},
	payments: Payment[] = [],
): {
	percentage: number;
	paidPayments: number;
	totalPayments: number;
} {
	// Total de cuotas mensuales + cuota final si existe
	let totalPayments = debt.number_of_payments;
	if (debt.final_payment && debt.final_payment > 0) {
		totalPayments += 1;
	}

	// Contar solo las cuotas mensuales pagadas (excluir pagos extras)
	const paidPayments = payments.filter(
		(payment) => payment.paid && !payment.is_extra_payment,
	).length;

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmountWithPayments(debt, payments);
	const percentage =
		totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;

	return { percentage, paidPayments, totalPayments };
}

// Nueva función para calcular monto restante con pagos reales
export function calculateRemainingAmountWithPayments(
	debt: {
		down_payment?: number;
		first_payment_date: string;
		monthly_amount: number;
		number_of_payments: number;
		final_payment?: number;
		final_payment_date?: string;
	},
	payments: Payment[] = [],
): number {
	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmountWithPayments(debt, payments);

	return Math.max(0, totalAmount - paidAmount);
}
