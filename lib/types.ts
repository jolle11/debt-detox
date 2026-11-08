export interface Debt {
	id?: string;
	user_id: string;
	name: string;
	entity: string;
	down_payment?: number; // Entrada/pago inicial
	first_payment_date: string; // Fecha de la primera cuota
	monthly_amount: number; // Importe mensual actual (puede cambiar con aportaciones extra)
	participants?: DebtParticipant[]; // Vacío si no hay reparto definido
	member_ids?: string[];
	my_percent?: number; // Porcentaje de quien consulta; lo calcula el servidor
	invite_email?: string; // Request-only: not stored on the debt.
	is_shared?: boolean; // Sin participantes: el usuario asume el 50 % de la cuota
	number_of_payments: number; // Número de cuotas actual (puede cambiar con aportaciones extra)
	original_monthly_amount?: number; // Importe mensual original (inmutable)
	original_number_of_payments?: number; // Número de cuotas original (inmutable)
	final_payment?: number; // Importe de la última cuota
	final_payment_date?: string; // Fecha de la última cuota (opcional)
	completed_at?: string; // Fecha real en la que se completó la financiación
	product_image?: string;
	created?: string;
	updated?: string;
	deleted?: string;
}

export interface DebtParticipant {
	user_id?: string; // Vacío para personas sin cuenta
	name: string;
	percent: number;
}

export type ExtraPaymentStrategy =
	| "none"
	| "reduce_installments"
	| "reduce_amount";

export interface DebtInvitation {
	id: string;
	debt_id: string;
	debt_name: string;
	sender_id: string;
	sender_name: string;
	recipient_id: string;
	recipient_name: string;
	status: "pending" | "accepted" | "rejected" | "cancelled" | "revoked";
	percent: number;
	expires_at: string;
}

export type DebtActivityAction =
	| "payment_marked"
	| "payment_unmarked"
	| "amount_changed"
	| "extra_added"
	| "extra_deleted"
	| "debt_completed"
	| "debt_reactivated"
	| "debt_edited"
	| "historical_confirmed"
	| "split_changed";

export interface DebtActivity {
	id: string;
	debt_id: string;
	actor_id: string;
	actor_name: string;
	action: DebtActivityAction;
	year?: number;
	month?: number;
	amount?: number;
	created: string;
}

export interface Payment {
	recorded_by?: string;
	recorded_by_name?: string;
	sharing_snapshot?: {
		owner: string;
		collaborator: string;
		owner_percent: number;
		shares?: Record<string, number>;
	};
	my_percent?: number; // Parte de quien consulta cuando se registró el pago
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
	DEBT_ACTIVITY: "debt_activity",
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
