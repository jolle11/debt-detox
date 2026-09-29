import type { Debt, Payment } from "@/lib/types";

// Keep the sample installments close to today so the dashboard shows a current payment.
const today = new Date();
const monthStart = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
const dateAt = (offset: number) => {
	const date = new Date(
		Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + offset, 1),
	);
	return date.toISOString().slice(0, 10);
};
const paymentAt = (
	debtId: string,
	offset: number,
	amount: number,
	paid: boolean,
): Payment => {
	const date = new Date(`${dateAt(offset)}T12:00:00Z`);
	return {
		id: `${debtId}-${offset}`,
		debt_id: debtId,
		month: date.getUTCMonth() + 1,
		year: date.getUTCFullYear(),
		planned_amount: amount,
		actual_amount: paid ? amount : undefined,
		paid,
		paid_date: paid ? date.toISOString() : undefined,
		created: date.toISOString(),
	};
};

export const mockDebts: Debt[] = [
	{
		id: "demo-laptop",
		user_id: "demo-user",
		name: "Portátil",
		entity: "Tienda de tecnología",
		down_payment: 200,
		first_payment_date: dateAt(-3),
		final_payment_date: dateAt(8),
		monthly_amount: 90,
		number_of_payments: 12,
		final_payment: 0,
		created: `${dateAt(-4)}T12:00:00Z`,
	},
	{
		id: "demo-mobile",
		user_id: "demo-user",
		name: "Móvil compartido",
		entity: "Operadora",
		collaborator_id: "demo-collaborator",
		collaborator_name: "Bruc",
		is_shared: true,
		down_payment: 0,
		first_payment_date: dateAt(-2),
		final_payment_date: dateAt(5),
		monthly_amount: 60,
		number_of_payments: 8,
		final_payment: 0,
		created: `${dateAt(-3)}T12:00:00Z`,
	},
	{
		id: "demo-sofa",
		user_id: "demo-user",
		name: "Sofá",
		entity: "Tienda de muebles",
		down_payment: 100,
		first_payment_date: dateAt(-6),
		final_payment_date: dateAt(-3),
		completed_at: dateAt(-3),
		monthly_amount: 120,
		number_of_payments: 4,
		final_payment: 0,
		created: `${dateAt(-7)}T12:00:00Z`,
	},
];

export const mockPayments: Payment[] = [
	...[-3, -2, -1].map((offset) => paymentAt("demo-laptop", offset, 90, true)),
	paymentAt("demo-laptop", 0, 90, false),
	...[-2, -1, 0].map((offset) => paymentAt("demo-mobile", offset, 60, true)),
	...[-6, -5, -4, -3].map((offset) =>
		paymentAt("demo-sofa", offset, 120, true),
	),
];
