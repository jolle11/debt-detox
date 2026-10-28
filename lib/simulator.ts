import type { PaymentStats } from "@/data/debtDetail";
import {
	addMonthsToDateOnly,
	formatDateOnly,
	parseDateOnly,
} from "@/lib/dateOnly";
import type { Debt, ExtraPaymentStrategy } from "@/lib/types";

export interface StrategyOutcome {
	monthlyAmount: number;
	totalInstallments: number;
	remainingInstallments: number;
}

/**
 * Mirrors pocketbase/pb_hooks/extra-payments.pb.js so the preview shows what
 * the server will apply for a one-off extra payment.
 */
export function simulateExtraPayment(
	debt: Debt,
	stats: PaymentStats,
	amount: number,
): Record<ExtraPaymentStrategy, StrategyOutcome> {
	const paidInstallments = stats.registeredPaidPayments;
	const remainingInstallments = Math.max(
		0,
		debt.number_of_payments - paidInstallments,
	);
	const remainingBalance = Math.max(0, stats.pendingAmount - amount);
	const fewerInstallments =
		debt.monthly_amount > 0
			? Math.ceil(remainingBalance / debt.monthly_amount)
			: remainingInstallments;

	return {
		none: {
			monthlyAmount: debt.monthly_amount,
			totalInstallments: debt.number_of_payments,
			remainingInstallments,
		},
		reduce_amount: {
			monthlyAmount:
				remainingInstallments > 0
					? Math.round((remainingBalance / remainingInstallments) * 100) / 100
					: 0,
			totalInstallments: debt.number_of_payments,
			remainingInstallments,
		},
		reduce_installments: {
			monthlyAmount: debt.monthly_amount,
			totalInstallments: paidInstallments + fewerInstallments,
			remainingInstallments: fewerInstallments,
		},
	};
}

export interface PayoffProjection {
	months: number;
	monthsSaved: number;
	payoffDate: string;
}

/** Months to clear the balance when paying a fixed extra amount every month. */
export function simulateMonthlyExtra(
	pendingAmount: number,
	monthlyAmount: number,
	remainingInstallments: number,
	extraPerMonth: number,
	now: Date = new Date(),
): PayoffProjection | null {
	const perMonth = monthlyAmount + Math.max(0, extraPerMonth);
	if (perMonth <= 0 || pendingAmount <= 0) return null;

	const months = Math.ceil(Math.round((pendingAmount / perMonth) * 100) / 100);
	return {
		months,
		monthsSaved: Math.max(0, remainingInstallments - months),
		payoffDate: addMonthsToDateOnly(formatDateOnly(now), months),
	};
}

export interface SavingsPlan {
	remaining: number;
	monthsLeft: number;
	monthlyNeeded: number;
	progress: number;
}

/** How much to set aside each month to reach a goal by a target date. */
export function calculateSavingsPlan(
	goal: number,
	saved: number,
	targetDate: string,
	now: Date = new Date(),
): SavingsPlan {
	const remaining = Math.max(0, goal - saved);
	const target = parseDateOnly(targetDate);
	const monthsLeft = target
		? Math.max(
				0,
				(target.getFullYear() - now.getFullYear()) * 12 +
					target.getMonth() -
					now.getMonth(),
			)
		: 0;

	return {
		remaining,
		monthsLeft,
		monthlyNeeded:
			remaining === 0
				? 0
				: Math.ceil((remaining / Math.max(1, monthsLeft)) * 100) / 100,
		progress: goal > 0 ? Math.min(100, Math.round((saved / goal) * 100)) : 0,
	};
}
