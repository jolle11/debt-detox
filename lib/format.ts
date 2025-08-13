export function formatNumber(value: number, decimals: number = 2): string {
	return new Intl.NumberFormat("es-ES", {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals,
	}).format(value);
}

export function formatCurrency(value: number, currency: string = "€"): string {
	const formatted = formatNumber(value, 2);
	return `${formatted} ${currency}`;
}

export function formatInteger(value: number): string {
	return formatNumber(value, 0);
}
