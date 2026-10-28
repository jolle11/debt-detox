import { addMonthsToDateOnly, parseDateOnly } from "@/lib/dateOnly";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import { calculateTotalAmount } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

export interface EvolutionPoint {
	/** "YYYY-MM" */
	period: string;
	remaining: number;
	projected: boolean;
}

function toPeriod(year: number, month: number): string {
	return `${year}-${month.toString().padStart(2, "0")}`;
}

function nextPeriod(period: string): string {
	return addMonthsToDateOnly(`${period}-01`, 1).slice(0, 7);
}

function schedule(debt: Debt): Map<string, number> {
	const amounts = new Map<string, number>();
	for (let offset = 0; offset < debt.number_of_payments; offset++) {
		const period = addMonthsToDateOnly(debt.first_payment_date, offset).slice(
			0,
			7,
		);
		amounts.set(period, (amounts.get(period) ?? 0) + debt.monthly_amount);
	}
	if ((debt.final_payment ?? 0) > 0) {
		const period = resolveFinalPaymentDate(debt).slice(0, 7);
		amounts.set(period, (amounts.get(period) ?? 0) + (debt.final_payment ?? 0));
	}
	return amounts;
}

/**
 * Month-end remaining balance across all debts: registered payments up to the
 * current month, then the remaining schedule projected forward. Linked debts
 * count by the user's half, matching the dashboard metrics.
 */
export function calculateDebtEvolution(
	debts: Debt[],
	payments: Payment[],
	now: Date = new Date(),
): EvolutionPoint[] {
	const current = toPeriod(now.getFullYear(), now.getMonth() + 1);
	const valid = debts.filter((debt) => parseDateOnly(debt.first_payment_date));
	if (valid.length === 0) return [];

	const series = valid.map((debt) => {
		const share = debt.collaborator_id ? 0.5 : 1;
		const total = calculateTotalAmount(debt);
		const start = addMonthsToDateOnly(debt.first_payment_date, -1).slice(0, 7);
		const completed = debt.completed_at?.slice(0, 7) || "";
		const finalDate = resolveFinalPaymentDate(debt);
		const finalPeriod = finalDate.slice(0, 7);

		const paidByPeriod = new Map<string, number>();
		const paidInstallments = new Set<string>();
		for (const payment of payments) {
			if (payment.debt_id !== debt.id || !payment.paid) continue;
			const period = toPeriod(payment.year, payment.month);
			paidByPeriod.set(
				period,
				(paidByPeriod.get(period) ?? 0) +
					(payment.actual_amount || payment.planned_amount),
			);
			if (!payment.is_extra_payment) paidInstallments.add(period);
		}

		const remainingAt = (period: string, paidSoFar: number) => {
			if (period < start) return 0;
			if (completed && period >= completed) return 0;
			// Same rule as the dashboard: a separate final payment counts once due.
			const finalDue =
				(debt.final_payment ?? 0) > 0 &&
				finalDate &&
				!paidInstallments.has(finalPeriod) &&
				period >= finalPeriod &&
				period <= current
					? (debt.final_payment ?? 0)
					: 0;
			return Math.max(0, total - paidSoFar - finalDue) * share;
		};

		// Installments still owed for projection, overdue ones included.
		const owed = [...schedule(debt).entries()].filter(
			([period]) => !paidInstallments.has(period),
		);

		return {
			start,
			end: [finalPeriod, completed].filter(Boolean).sort().at(-1) as string,
			remainingAt,
			paidByPeriod,
			owed,
			share,
			down: debt.down_payment || 0,
		};
	});

	const first = series.map((s) => s.start).sort()[0];
	const last = [current, ...series.map((s) => s.end)].sort().at(-1) as string;

	const points: EvolutionPoint[] = [];
	const paidSoFar = series.map((s) => s.down);
	const projectedRemaining: number[] = [];

	for (let period = first; period <= last; period = nextPeriod(period)) {
		const projected = period > current;
		let remaining = 0;
		series.forEach((s, index) => {
			if (!projected) {
				paidSoFar[index] += s.paidByPeriod.get(period) ?? 0;
				const value = s.remainingAt(period, paidSoFar[index]);
				projectedRemaining[index] = value;
				remaining += value;
				return;
			}
			// Debts that haven't started yet enter the chart at their start.
			if (period <= s.start) {
				projectedRemaining[index] = s.remainingAt(period, paidSoFar[index]);
				remaining += projectedRemaining[index];
				return;
			}
			const due = s.owed
				.filter(([owedPeriod]) =>
					owedPeriod > current
						? owedPeriod === period
						: period === nextPeriod(current),
				)
				.reduce((sum, [, amount]) => sum + amount * s.share, 0);
			projectedRemaining[index] = Math.max(0, projectedRemaining[index] - due);
			remaining += projectedRemaining[index];
		});
		points.push({
			period,
			remaining: Math.round(remaining * 100) / 100,
			projected,
		});
	}

	return points;
}
