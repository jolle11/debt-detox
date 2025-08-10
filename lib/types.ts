export interface Debt {
	id?: string;
	name: string;
	entity: string;
	start_date: string;
	end_date: string;
	initial_amount?: number;
	final_amount: number;
	tin?: number;
	tae?: number;
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
