export interface Debt {
	id?: string;
	user_id: string;
	name: string;
	entity: string;
	down_payment?: number; // Entrada/pago inicial
	first_payment_date: string; // Fecha de la primera cuota
	monthly_amount: number; // Importe mensual actual (puede cambiar con aportaciones extra)
	number_of_payments: number; // Número de cuotas actual (puede cambiar con aportaciones extra)
	original_monthly_amount?: number; // Importe mensual original (inmutable)
	original_number_of_payments?: number; // Número de cuotas original (inmutable)
	final_payment?: number; // Importe de la última cuota
	final_payment_date?: string; // Fecha de la última cuota (opcional)
	product_image?: string;
	created?: string;
	updated?: string;
	deleted?: string;
}

export type ExtraPaymentStrategy =
	| "none"
	| "reduce_installments"
	| "reduce_amount";

export interface Payment {
	id?: string;
	debt_id: string;
	month: number;
	year: number;
	planned_amount: number;
	actual_amount?: number;
	paid: boolean;
	paid_date?: string;
	is_extra_payment?: boolean;
	created?: string;
	deleted?: string;
}

export interface SharedDebt {
	id?: string;
	token: string;
	debt_id: string;
	user_id: string;
	expires_at: string;
	show_amounts: boolean;
	show_entity: boolean;
	show_dates: boolean;
	created?: string;
	deleted?: string;
}

export interface SharedProfile {
	id?: string;
	token: string;
	user_id: string;
	expires_at: string;
	show_amounts: boolean;
	show_debt_list: boolean;
	show_completed: boolean;
	created?: string;
	deleted?: string;
}

export const COLLECTIONS = {
	DEBTS: "debts",
	PAYMENTS: "payments",
	SHARED_DEBTS: "shared_debts",
	SHARED_PROFILES: "shared_profiles",
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
