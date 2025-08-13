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
