import type { Debt, Payment } from "@/lib/types";

// Datos de ejemplo para la demo - financiaciones más pequeñas y cortas
export const mockDebts: Debt[] = [
	{
		id: "demo-laptop",
		name: "Portátil Gaming",
		entity: "MediaMarkt",
		down_payment: 200,
		first_payment_date: "2025-04-01",
		final_payment_date: "2025-09-30", // 6 meses - ACTIVA (termina en septiembre 2025)
		monthly_amount: 180,
		number_of_payments: 6,
		final_payment: 0,
		product_image: undefined,
		created: "2025-03-15T00:00:00Z",
		updated: "2025-03-15T00:00:00Z",
		deleted: undefined,
	},
	{
		id: "demo-mobile",
		name: "iPhone 15",
		entity: "Orange",
		down_payment: 0,
		first_payment_date: "2025-01-01",
		final_payment_date: "2025-12-31", // 12 meses - ACTIVA
		monthly_amount: 65,
		number_of_payments: 12,
		final_payment: 0,
		product_image: undefined,
		created: "2024-12-20T00:00:00Z",
		updated: "2024-12-20T00:00:00Z",
		deleted: undefined,
	},
	{
		id: "demo-sofa",
		name: "Sofá 3 Plazas",
		entity: "IKEA",
		down_payment: 100,
		first_payment_date: "2024-11-01",
		final_payment_date: "2025-02-28", // Pasado - COMPLETADA
		monthly_amount: 120,
		number_of_payments: 4,
		final_payment: 0,
		product_image: undefined,
		created: "2024-10-15T00:00:00Z",
		updated: "2024-10-15T00:00:00Z",
		deleted: undefined,
	},
];

export const mockPayments: Payment[] = [
	// Portátil Gaming - 5 cuotas pagadas de 6 (ACTIVA - casi terminando)
	// Empezó en abril 2025, ha pagado Abr, May, Jun, Jul, Ago (5 de 6)
	...Array.from({ length: 5 }, (_, i) => {
		const date = new Date(2025, 3 + i, 1); // Abr-Ago 2025 (months 3-7)
		return {
			id: `demo-laptop-payment-${i}`,
			debt_id: "demo-laptop",
			month: date.getMonth() + 1,
			year: date.getFullYear(),
			planned_amount: 180,
			actual_amount: 180,
			paid: true,
			paid_date: date.toISOString(),
			created: date.toISOString(),
			deleted: undefined,
		};
	}),

	// iPhone - 8 cuotas pagadas de 12 (ACTIVA - 67% progreso)
	// Empezó en enero 2025, ha pagado Ene-Ago (8 de 12)
	...Array.from({ length: 8 }, (_, i) => {
		const date = new Date(2025, i, 1); // Ene-Ago 2025 (months 0-7)
		return {
			id: `demo-mobile-payment-${i}`,
			debt_id: "demo-mobile",
			month: date.getMonth() + 1,
			year: date.getFullYear(),
			planned_amount: 65,
			actual_amount: 65,
			paid: true,
			paid_date: date.toISOString(),
			created: date.toISOString(),
			deleted: undefined,
		};
	}),

	// Sofá - COMPLETADO (4 cuotas pagadas - 100%)
	...Array.from({ length: 4 }, (_, i) => {
		const date = new Date(2024, 10 + i, 1); // Nov 2024 - Feb 2025
		return {
			id: `demo-sofa-payment-${i}`,
			debt_id: "demo-sofa",
			month: date.getMonth() + 1,
			year: date.getFullYear(),
			planned_amount: 120,
			actual_amount: 120,
			paid: true,
			paid_date: date.toISOString(),
			created: date.toISOString(),
			deleted: undefined,
		};
	}),
];

// Hook para simular la experiencia de usuario con datos de demo
export function useDemoData() {
	return {
		debts: mockDebts,
		payments: mockPayments,
		isLoading: false,
		error: null,
		refetch: () => {},
	};
}
