import { calculateDashboardMetrics } from "@/lib/dashboardWidgets";
import { addMonthsToDateOnly, parseDateOnly } from "@/lib/dateOnly";
import {
	calculateDebtEvolution,
	type EvolutionPoint,
	schedule,
} from "@/lib/debtEvolution";
import { calculateRemainingAmountWithPayments } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import {
	calculateMonthlyContribution,
	debtShare,
	monthlyShare,
} from "@/utils/debtCalculations";

export interface MetricsSummary {
	remaining: number;
	changeFromLastMonth: number | null;
	changeFromLastYear: number | null;
	/** "YYYY-MM" of the first month with nothing left; null if already clear. */
	debtFreePeriod: string | null;
	monthsLeft: number | null;
	paidPercent: number;
}

export interface LoadPoint {
	/** "YYYY-MM" */
	period: string;
	amount: number;
}

export interface LoadRelief {
	period: string;
	amount: number;
}

export interface UpcomingLoad {
	points: LoadPoint[];
	/** First month the recurring installments go down. */
	relief: LoadRelief | null;
}

export type BreakdownGroup = "debt" | "entity";

export interface BreakdownRow {
	key: string;
	label: string;
	remaining: number;
}

const round = (value: number) => Math.round(value * 100) / 100;

function currentPeriod(now: Date): string {
	return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
}

function shiftPeriod(period: string, months: number): string {
	return addMonthsToDateOnly(`${period}-01`, months).slice(0, 7);
}

function monthsBetween(from: string, to: string): number {
	const [fromYear, fromMonth] = from.split("-").map(Number);
	const [toYear, toMonth] = to.split("-").map(Number);
	return (toYear - fromYear) * 12 + toMonth - fromMonth;
}

export function niceMax(value: number): number {
	if (value <= 0) return 1;
	const magnitude = 10 ** Math.floor(Math.log10(value));
	const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4) ?? 10;
	return Math.ceil(value / (step * magnitude)) * step * magnitude;
}

/** The headline figures, with the balance matching the dashboard's. */
export function calculateMetricsSummary(
	debts: Debt[],
	payments: Payment[],
	now: Date = new Date(),
): MetricsSummary {
	const points = calculateDebtEvolution(debts, payments, now);
	const { remainingDebt, originalDebt, totalPaid } = calculateDashboardMetrics(
		debts,
		payments,
		now,
	);
	const current = currentPeriod(now);
	const balanceAt = (period: string) =>
		points.find((point) => point.period === period)?.remaining ?? null;
	const change = (monthsAgo: number) => {
		const latest = balanceAt(current);
		const past = balanceAt(shiftPeriod(current, -monthsAgo));
		return latest === null || past === null ? null : round(latest - past);
	};

	let debtFreePeriod: string | null = null;
	const lastOwing = points.findLastIndex((point) => point.remaining > 0);
	if (remainingDebt > 0 && lastOwing >= 0) {
		debtFreePeriod = (points[lastOwing + 1] ?? points[lastOwing]).period;
	}

	return {
		remaining: remainingDebt,
		changeFromLastMonth: change(1),
		changeFromLastYear: change(12),
		debtFreePeriod,
		monthsLeft: debtFreePeriod
			? Math.max(0, monthsBetween(current, debtFreePeriod))
			: null,
		paidPercent:
			originalDebt > 0 ? Math.round((totalPaid / originalDebt) * 100) : 0,
	};
}

/** What is still due each future month, from next month to the last payment. */
export function calculateUpcomingLoad(
	debts: Debt[],
	payments: Payment[],
	now: Date = new Date(),
): UpcomingLoad {
	const current = currentPeriod(now);
	const active = debts.filter(
		(debt) => !debt.completed_at && parseDateOnly(debt.first_payment_date),
	);
	const amounts = new Map<string, number>();
	const recurring = new Map<string, number>();

	for (const debt of active) {
		const share = monthlyShare(debt);
		const paid = new Set(
			payments
				.filter(
					(payment) =>
						payment.debt_id === debt.id &&
						payment.paid &&
						!payment.is_extra_payment,
				)
				.map(
					(payment) =>
						`${payment.year}-${payment.month.toString().padStart(2, "0")}`,
				),
		);
		for (const [period, amount] of schedule(debt)) {
			if (period > current && !paid.has(period)) {
				amounts.set(period, (amounts.get(period) ?? 0) + amount * share);
			}
		}
		// Ignores payments made early, so paying ahead doesn't look like a drop.
		for (let offset = 0; offset < debt.number_of_payments; offset++) {
			const period = addMonthsToDateOnly(debt.first_payment_date, offset).slice(
				0,
				7,
			);
			if (period > current) {
				recurring.set(
					period,
					(recurring.get(period) ?? 0) + calculateMonthlyContribution(debt),
				);
			}
		}
	}

	const last = [...amounts.keys(), ...recurring.keys()].sort().at(-1);
	if (!last) return { points: [], relief: null };

	const points: LoadPoint[] = [];
	let relief: LoadRelief | null = null;
	for (
		let period = shiftPeriod(current, 1);
		period <= last;
		period = shiftPeriod(period, 1)
	) {
		points.push({ period, amount: round(amounts.get(period) ?? 0) });
		const following = shiftPeriod(period, 1);
		const drop = (recurring.get(period) ?? 0) - (recurring.get(following) ?? 0);
		if (!relief && drop > 0.005) {
			relief = { period: following, amount: round(drop) };
		}
	}

	return { points, relief };
}

/** Outstanding balance per debt or per entity, largest first. */
export function calculateBreakdown(
	debts: Debt[],
	payments: Payment[],
	group: BreakdownGroup,
): BreakdownRow[] {
	const rows = new Map<string, BreakdownRow>();

	for (const debt of debts) {
		if (debt.completed_at) continue;
		const remaining =
			calculateRemainingAmountWithPayments(
				debt,
				payments.filter((payment) => payment.debt_id === debt.id),
			) * debtShare(debt);
		const entity = debt.entity?.trim() ?? "";
		const key = group === "debt" ? (debt.id ?? debt.name) : entity;
		const label = group === "debt" ? debt.name : entity;
		const row = rows.get(key) ?? { key, label, remaining: 0 };
		row.remaining += remaining;
		rows.set(key, row);
	}

	return [...rows.values()]
		.map((row) => ({ ...row, remaining: round(row.remaining) }))
		.filter((row) => row.remaining > 0)
		.sort((left, right) => right.remaining - left.remaining);
}

/** Debt names by the month they enter the evolution chart. */
export function calculateDebtStarts(debts: Debt[]): Map<string, string[]> {
	const starts = new Map<string, string[]>();
	for (const debt of debts) {
		if (!parseDateOnly(debt.first_payment_date)) continue;
		const period = addMonthsToDateOnly(debt.first_payment_date, -1).slice(0, 7);
		starts.set(period, [...(starts.get(period) ?? []), debt.name]);
	}
	return starts;
}

/** Points within `months` either side of today; everything if that's too few. */
export function filterEvolutionRange(
	points: EvolutionPoint[],
	months: number | null,
	now: Date = new Date(),
): EvolutionPoint[] {
	if (months === null) return points;
	const current = currentPeriod(now);
	const from = shiftPeriod(current, -months);
	const to = shiftPeriod(current, months);
	const visible = points.filter(
		(point) => point.period >= from && point.period <= to,
	);
	return visible.length < 2 ? points : visible;
}
