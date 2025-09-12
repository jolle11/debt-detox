export interface Debt {
	id?: string;
	user_id: string;
	name: string;
	entity: string;
	down_payment?: number; // Entrada/pago inicial
	first_payment_date: string; // Fecha de la primera cuota
	monthly_amount: number; // Importe mensual
	number_of_payments: number; // Número de cuotas
	final_payment?: number; // Importe de la última cuota
	final_payment_date?: string; // Fecha de la última cuota (opcional)
	product_image?: string;
	created?: string;
	updated?: string;
	deleted?: string;
}

export interface Payment {
	id?: string;
	debt_id: string;
	month: number;
	year: number;
	planned_amount: number;
	actual_amount?: number;
	paid: boolean;
	paid_date?: string;
	created?: string;
	deleted?: string;
}

export const COLLECTIONS = {
	DEBTS: "debts",
	PAYMENTS: "payments",
} as const;

export interface DebtCalculations {
	completedPercentage: number;
	remainingPercentage: number;
	totalAmount: number;
	remainingAmount: number;
	monthsTotal: number;
	monthsCompleted: number;
	monthsRemaining: number;
}
