export const CURRENCIES = [
	{ code: "EUR", symbol: "€", name: "Euro" },
	{ code: "USD", symbol: "$", name: "US Dollar" },
	{ code: "GBP", symbol: "£", name: "British Pound" },
	{ code: "CAD", symbol: "C$", name: "Canadian Dollar" },
	{ code: "AUD", symbol: "A$", name: "Australian Dollar" },
	{ code: "CHF", symbol: "CHF", name: "Swiss Franc" },
	{ code: "SEK", symbol: "kr", name: "Swedish Krona" },
	{ code: "NOK", symbol: "kr", name: "Norwegian Krone" },
	{ code: "DKK", symbol: "kr", name: "Danish Krone" },
	{ code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export function getCurrencySymbol(currencyCode: string): string {
	const currency = CURRENCIES.find((c) => c.code === currencyCode);
	return currency?.symbol || "€";
}
