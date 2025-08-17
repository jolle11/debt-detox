export function formatNumber(value: number, decimals: number = 2): string {
	return new Intl.NumberFormat("es-ES", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

export function formatCurrency(value: number, currency: string = "€"): string {
	const decimals = value % 1 === 0 ? 0 : 2;
	const formatted = formatNumber(value, decimals);
	return `${formatted} ${currency}`;
}

export function formatInteger(value: number): string {
	return formatNumber(value, 0);
}

// Nuevo modelo de cálculos basado en cuotas y fechas específicas

export function calculateDebtStatus(
	finalPaymentDate: string,
): "active" | "completed" {
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
	final_payment_date: string;
}): number {
	const now = new Date();
	const firstPayment = new Date(debt.first_payment_date);
	const finalPayment = new Date(debt.final_payment_date);

	let paidAmount = debt.down_payment || 0; // Entrada siempre está pagada

	if (now < firstPayment) {
		// Aún no ha empezado a pagar cuotas
		return paidAmount;
	}

	if (now >= finalPayment) {
		// Ya terminó todo
		return calculateTotalAmount(debt);
	}

	// Calcular cuotas mensuales pagadas
	const monthsElapsed =
		Math.max(
			0,
			Math.floor(
				(now.getTime() - firstPayment.getTime()) /
					(30.44 * 24 * 60 * 60 * 1000),
			),
		) + 1; // +1 porque el primer mes cuenta

	const paidMonthlyPayments = Math.min(
		monthsElapsed,
		debt.number_of_payments,
	);
	paidAmount += paidMonthlyPayments * debt.monthly_amount;

	// Si ya llegó la fecha de la cuota final, agregarla
	if (now >= finalPayment && debt.final_payment) {
		paidAmount += debt.final_payment;
	}

	return paidAmount;
}

export function calculateRemainingAmount(debt: {
	down_payment?: number;
	first_payment_date: string;
	monthly_amount: number;
	number_of_payments: number;
	final_payment?: number;
	final_payment_date: string;
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
	final_payment_date: string;
}): {
	percentage: number;
	paidPayments: number;
	totalPayments: number;
} {
	const now = new Date();
	const firstPayment = new Date(debt.first_payment_date);
	const finalPayment = new Date(debt.final_payment_date);

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

	// Calcular cuotas mensuales pagadas
	const monthsElapsed =
		Math.max(
			0,
			Math.floor(
				(now.getTime() - firstPayment.getTime()) /
					(30.44 * 24 * 60 * 60 * 1000),
			),
		) + 1;

	paidPayments = Math.min(monthsElapsed, debt.number_of_payments);

	// Si ya llegó la fecha final, agregar esa cuota
	if (now >= finalPayment && debt.final_payment) {
		paidPayments += 1;
	}

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmount(debt);
	const percentage = Math.round((paidAmount / totalAmount) * 100);

	return { percentage, paidPayments, totalPayments };
}
