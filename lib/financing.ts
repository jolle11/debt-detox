import { addMonthsToDateOnly, parseDateOnly } from "@/lib/dateOnly";
import type { Debt, Payment } from "@/lib/types";
import { debtShare } from "@/utils/debtCalculations";

/** A fixed-rate plan; the first installment falls one month after the loan. */
export interface AmortizationRow {
	/** "YYYY-MM" */
	period: string;
	payment: number;
	interest: number;
	capital: number;
	balance: number;
}

export interface FinancingPlan {
	financed: number;
	fee: number;
	monthlyRate: number;
	impliedTin: number;
	impliedTae: number | null;
	interest: number;
	totalCost: number;
	costPercent: number;
	rows: AmortizationRow[];
}

export interface FinancingAnalysis {
	tin: number | null;
	tae: number | null;
	tinIsImplied: boolean;
	taeIsImplied: boolean;
	/** The contract rates and the installments don't tell the same story. */
	ratesDiffer: boolean;
	/** The financed amount is more than everything that will be paid. */
	inconsistent: boolean;
	plan: FinancingPlan | null;
}

export interface FinancingSummary {
	totalCost: number;
	averageTae: number | null;
	included: number;
	missing: number;
}

const RATE_TOLERANCE_POINTS = 0.5;
const round = (value: number) => Math.round(value * 100) / 100;

function monthsBetween(from: string, to: string): number {
	const [fromYear, fromMonth] = from.slice(0, 7).split("-").map(Number);
	const [toYear, toMonth] = to.slice(0, 7).split("-").map(Number);
	return (toYear - fromYear) * 12 + toMonth - fromMonth;
}

function buildSchedule(debt: Debt): number[] {
	const monthly = debt.original_monthly_amount || debt.monthly_amount;
	const count = debt.original_number_of_payments || debt.number_of_payments;
	const schedule = Array.from({ length: count }, () => monthly);
	const finalPayment = debt.final_payment ?? 0;
	if (finalPayment > 0) {
		const offset = debt.final_payment_date
			? monthsBetween(debt.first_payment_date, debt.final_payment_date)
			: count;
		const index = Math.max(offset, count);
		while (schedule.length <= index) schedule.push(0);
		schedule[index] = finalPayment;
	}
	return schedule;
}

/** The monthly rate at which the schedule is worth `target` today. */
function solveMonthlyRate(schedule: number[], target: number): number | null {
	const presentValue = (rate: number) =>
		schedule.reduce(
			(sum, amount, index) => sum + amount / (1 + rate) ** (index + 1),
			0,
		);
	const total = presentValue(0);
	if (target <= 0 || target > total + 0.005) return null;
	if (total - target <= 0.005) return 0;

	let low = 0;
	let high = 1;
	if (presentValue(high) > target) return null;
	for (let step = 0; step < 80; step++) {
		const middle = (low + high) / 2;
		if (presentValue(middle) > target) low = middle;
		else high = middle;
	}
	return (low + high) / 2;
}

const annualized = (monthlyRate: number) => ((1 + monthlyRate) ** 12 - 1) * 100;

export function analyzeFinancing(debt: Debt): FinancingAnalysis {
	const contractTin = debt.tin && debt.tin > 0 ? debt.tin : null;
	const contractTae = debt.tae && debt.tae > 0 ? debt.tae : null;
	const financed = debt.financed_amount ?? 0;
	const fee = debt.opening_fee ?? 0;
	const noPlan = {
		tin: contractTin,
		tae: contractTae,
		tinIsImplied: false,
		taeIsImplied: false,
		ratesDiffer: false,
		inconsistent: false,
		plan: null,
	};
	if (financed <= 0 || !parseDateOnly(debt.first_payment_date)) return noPlan;

	const schedule = buildSchedule(debt);
	const monthlyRate = solveMonthlyRate(schedule, financed);
	if (monthlyRate === null) return { ...noPlan, inconsistent: true };

	const taeRate = solveMonthlyRate(schedule, financed - fee);
	const impliedTin = round(monthlyRate * 1200);
	const impliedTae = taeRate === null ? null : round(annualized(taeRate));

	let balance = financed;
	const rows = schedule.map((payment, index) => {
		const interest = balance * monthlyRate;
		const capital = payment - interest;
		balance =
			index === schedule.length - 1 ? 0 : Math.max(0, balance - capital);
		return {
			period: addMonthsToDateOnly(debt.first_payment_date, index).slice(0, 7),
			payment,
			interest: round(interest),
			capital: round(capital),
			balance: round(balance),
		};
	});
	const paid = schedule.reduce((sum, amount) => sum + amount, 0);
	const interest = round(Math.max(0, paid - financed));
	const totalCost = round(interest + fee);

	const differs = (contract: number | null, implied: number | null) =>
		contract !== null &&
		implied !== null &&
		Math.abs(contract - implied) > RATE_TOLERANCE_POINTS;

	return {
		tin: contractTin ?? impliedTin,
		tae: contractTae ?? impliedTae,
		tinIsImplied: contractTin === null,
		taeIsImplied: contractTae === null && impliedTae !== null,
		ratesDiffer:
			differs(contractTin, impliedTin) || differs(contractTae, impliedTae),
		inconsistent: false,
		plan: {
			financed,
			fee,
			monthlyRate,
			impliedTin,
			impliedTae,
			interest,
			totalCost,
			costPercent: round((totalCost / financed) * 100),
			rows,
		},
	};
}

/** Capital still owed, given the installments and extras actually paid. */
export function calculateOutstandingCapital(
	debt: Debt,
	plan: FinancingPlan,
	payments: Payment[],
): number {
	if (debt.completed_at) return 0;
	const paid = payments.filter((payment) => payment.paid);
	const paidPeriods = new Set(
		paid
			.filter((payment) => !payment.is_extra_payment)
			.map(
				(payment) =>
					`${payment.year}-${payment.month.toString().padStart(2, "0")}`,
			),
	);
	const amortized = plan.rows
		.filter((row) => paidPeriods.has(row.period))
		.reduce((sum, row) => sum + row.capital, 0);
	const extras = paid
		.filter((payment) => payment.is_extra_payment)
		.reduce(
			(sum, payment) => sum + (payment.actual_amount ?? payment.planned_amount),
			0,
		);
	return round(Math.max(0, plan.financed - amortized - extras));
}

/** The installment that amortizes the loan at a given TIN. */
export function suggestMonthlyAmount(
	financedAmount: number | undefined,
	tin: number | undefined,
	numberOfPayments: number | undefined,
	finalPayment: number | undefined,
): number | null {
	const financed = Number(financedAmount);
	const annualRate = Number(tin);
	const count = Number(numberOfPayments);
	const balloon = Number(finalPayment) || 0;
	if (!(financed > 0 && annualRate > 0 && count > 0)) return null;

	const rate = annualRate / 1200;
	const financedByInstallments = financed - balloon / (1 + rate) ** (count + 1);
	if (financedByInstallments <= 0) return null;
	return round((financedByInstallments * rate) / (1 - (1 + rate) ** -count));
}

function interestOver(
	capital: number,
	rate: number,
	monthly: number,
	months: number,
): number {
	let balance = capital;
	let interest = 0;
	for (let month = 0; month < months && balance > 0.005; month++) {
		const accrued = balance * rate;
		interest += accrued;
		balance = Math.max(0, balance + accrued - monthly);
	}
	// Whatever is left is settled by the final payment a month later.
	return interest + balance * rate;
}

export interface InterestSavingInput {
	capital: number;
	monthlyRate: number;
	monthly: number;
	installmentsLeft: number;
	finalPayment: number;
	lump?: number;
	extraPerMonth?: number;
	/** "term" keeps the installment; "amount" lowers it and keeps the term. */
	mode: "term" | "amount";
}

/** Interest avoided by paying early, compared with the current plan. */
export function estimateInterestSaving({
	capital,
	monthlyRate: rate,
	monthly,
	installmentsLeft: months,
	finalPayment,
	lump = 0,
	extraPerMonth = 0,
	mode,
}: InterestSavingInput): number {
	if (rate <= 0 || capital <= 0 || months <= 0) return 0;
	const start = Math.max(0, capital - lump);
	const planned = interestOver(capital, rate, monthly, months);

	let payment = monthly + extraPerMonth;
	if (mode === "amount") {
		const financedByInstallments =
			start - finalPayment / (1 + rate) ** (months + 1);
		payment =
			financedByInstallments > 0
				? (financedByInstallments * rate) / (1 - (1 + rate) ** -months)
				: 0;
	}
	return round(
		Math.max(0, planned - interestOver(start, rate, payment, months)),
	);
}

/** Cost and average TAE across debts, by the user's part of each one. */
export function calculateFinancingSummary(debts: Debt[]): FinancingSummary {
	let totalCost = 0;
	let weightedTae = 0;
	let weight = 0;
	let included = 0;
	for (const debt of debts) {
		const { plan, tae } = analyzeFinancing(debt);
		if (!plan) continue;
		const share = debtShare(debt);
		included += 1;
		totalCost += plan.totalCost * share;
		if (tae !== null) {
			weightedTae += tae * plan.financed * share;
			weight += plan.financed * share;
		}
	}
	return {
		totalCost: round(totalCost),
		averageTae: weight > 0 ? round(weightedTae / weight) : null,
		included,
		missing: debts.length - included,
	};
}
