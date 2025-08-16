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

export function calculateDebtStatus(endDate: string): "active" | "completed" {
	const now = new Date();
	const end = new Date(endDate);
	return end <= now ? "completed" : "active";
}

export function calculateMonthlyPayment(
	finalAmount: number,
	startDate: string,
	endDate: string,
): number {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const monthsDiff =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());

	if (monthsDiff <= 0) return finalAmount;
	return finalAmount / monthsDiff;
}

export function calculateCurrentAmount(
	finalAmount: number,
	startDate: string,
	endDate: string,
): number {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (now >= end) return 0;
	if (now <= start) return finalAmount;

	const totalMonths =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());
	const elapsedMonths =
		(now.getFullYear() - start.getFullYear()) * 12 +
		(now.getMonth() - start.getMonth());

	const progress = Math.min(elapsedMonths / totalMonths, 1);
	return finalAmount * (1 - progress);
}

export function calculateProgress(startDate: string, endDate: string): number {
	const now = new Date();
	const start = new Date(startDate);
	const end = new Date(endDate);

	if (now >= end) return 100;
	if (now <= start) return 0;

	const totalMonths =
		(end.getFullYear() - start.getFullYear()) * 12 +
		(end.getMonth() - start.getMonth());
	const elapsedMonths =
		(now.getFullYear() - start.getFullYear()) * 12 +
		(now.getMonth() - start.getMonth());

	return Math.round(Math.min((elapsedMonths / totalMonths) * 100, 100));
}
