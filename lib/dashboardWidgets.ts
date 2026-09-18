import { resolveFinalPaymentDate } from "@/lib/debtDates";
import {
	calculatePaymentProgressWithPayments,
	calculateRemainingAmountWithPayments,
	calculateTotalAmount,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import { calculateMonthlyContribution } from "@/utils/debtCalculations";

export const DASHBOARD_WIDGET_IDS = [
	"remainingDebt",
	"monthlyPayment",
	"completedDebts",
	"averageProgress",
	"originalDebt",
	"totalPaid",
	"activeDebts",
	"paidThisMonth",
	"extraPayments",
	"nextCompletion",
] as const;

export type DashboardWidgetId = (typeof DASHBOARD_WIDGET_IDS)[number];

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetId[] = [
	"remainingDebt",
	"monthlyPayment",
	"completedDebts",
	"averageProgress",
];

const widgetIds = new Set<string>(DASHBOARD_WIDGET_IDS);

export function normalizeDashboardWidgets(value: unknown): DashboardWidgetId[] {
	if (!Array.isArray(value)) return [...DEFAULT_DASHBOARD_WIDGETS];

	return [...new Set(value)].filter(
		(id): id is DashboardWidgetId =>
			typeof id === "string" && widgetIds.has(id),
	);
}

export interface DashboardMetrics {
	remainingDebt: number;
	monthlyPayment: number;
	completedDebts: number;
	averageProgress: number;
	originalDebt: number;
	totalPaid: number;
	activeDebts: number;
	paidThisMonth: number;
	extraPayments: number;
	nextCompletion: Debt | null;
}

export function calculateDashboardMetrics(
	debts: Debt[],
	payments: Payment[],
	now: Date = new Date(),
): DashboardMetrics {
	const activeDebts = debts.filter((debt) => !debt.completed_at);
	const completedDebts = debts.filter((debt) => Boolean(debt.completed_at));
	const paymentsByDebt = new Map<string, Payment[]>();

	for (const payment of payments) {
		if (!payment.debt_id) continue;
		const debtPayments = paymentsByDebt.get(payment.debt_id) ?? [];
		debtPayments.push(payment);
		paymentsByDebt.set(payment.debt_id, debtPayments);
	}

	const originalDebt = debts.reduce(
		(sum, debt) =>
			sum + calculateTotalAmount(debt) * (debt.collaborator_id ? 0.5 : 1),
		0,
	);
	const remainingDebt = activeDebts.reduce(
		(sum, debt) =>
			sum +
			calculateRemainingAmountWithPayments(
				debt,
				paymentsByDebt.get(debt.id ?? "") ?? [],
			) *
				(debt.collaborator_id ? 0.5 : 1),
		0,
	);
	const activeProgress = activeDebts.map(
		(debt) =>
			calculatePaymentProgressWithPayments(
				debt,
				paymentsByDebt.get(debt.id ?? "") ?? [],
			).percentage,
	);
	const personalPaymentAmount = (payment: Payment) =>
		(payment.actual_amount ?? payment.planned_amount) *
		(debts.find((debt) => debt.id === payment.debt_id)?.collaborator_id
			? 0.5
			: 1);
	const paidThisMonth = payments
		.filter(
			(payment) =>
				payment.paid &&
				payment.month === now.getMonth() + 1 &&
				payment.year === now.getFullYear(),
		)
		.reduce((sum, payment) => sum + personalPaymentAmount(payment), 0);
	const extraPayments = payments
		.filter((payment) => payment.paid && payment.is_extra_payment)
		.reduce((sum, payment) => sum + personalPaymentAmount(payment), 0);
	const nextCompletion =
		[...activeDebts].sort((left, right) =>
			resolveFinalPaymentDate(left).localeCompare(
				resolveFinalPaymentDate(right),
			),
		)[0] ?? null;

	return {
		remainingDebt,
		monthlyPayment: activeDebts.reduce(
			(sum, debt) => sum + calculateMonthlyContribution(debt),
			0,
		),
		completedDebts: completedDebts.length,
		averageProgress:
			activeProgress.length > 0
				? Math.round(
						activeProgress.reduce((sum, value) => sum + value, 0) /
							activeProgress.length,
					)
				: 0,
		originalDebt,
		totalPaid: Math.max(0, originalDebt - remainingDebt),
		activeDebts: activeDebts.length,
		paidThisMonth,
		extraPayments,
		nextCompletion,
	};
}
