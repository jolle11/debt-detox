export interface Debt {
	id: number;
	name: string;
	entity: string;
	initialAmount: number;
	currentAmount: number;
	monthlyPayment: number;
	endDate: string;
	progress: number;
	status: "active" | "completed";
}

export const mockDebts: Debt[] = [
	{
		id: 1,
		name: "Préstamo Personal Santander",
		entity: "Banco Santander",
		initialAmount: 10000,
		currentAmount: 7500,
		monthlyPayment: 350,
		endDate: "2025-12-31",
		progress: 25,
		status: "active",
	},
	{
		id: 2,
		name: "Tarjeta de Crédito BBVA",
		entity: "BBVA",
		initialAmount: 5000,
		currentAmount: 2800,
		monthlyPayment: 200,
		endDate: "2024-08-30",
		progress: 44,
		status: "active",
	},
	{
		id: 3,
		name: "Financiación Coche",
		entity: "Ford Credit",
		initialAmount: 15000,
		currentAmount: 0,
		monthlyPayment: 0,
		endDate: "2024-01-15",
		progress: 100,
		status: "completed",
	},
];
