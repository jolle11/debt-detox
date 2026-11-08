import assert from "node:assert/strict";
import { test } from "node:test";
import {
	analyzeFinancing,
	calculateFinancingSummary,
	calculateOutstandingCapital,
	estimateInterestSaving,
	suggestMonthlyAmount,
} from "../../lib/financing.ts";

const loan = {
	id: "car",
	user_id: "owner",
	name: "Car",
	entity: "Bank",
	first_payment_date: "2026-01-15",
	monthly_amount: 443.21,
	number_of_payments: 24,
	financed_amount: 10000,
};
const near = (actual, expected, margin = 0.02) =>
	assert.ok(Math.abs(actual - expected) <= margin, `${actual} ≉ ${expected}`);

test("a 6% loan yields its TIN, TAE and interest from the installments", () => {
	const { tin, tae, tinIsImplied, plan } = analyzeFinancing(loan);
	near(tin, 6);
	near(tae, 6.17);
	assert.equal(tinIsImplied, true);
	near(plan.interest, 637.04);
	assert.equal(plan.rows.length, 24);
	assert.equal(plan.rows.at(-1).balance, 0);
	near(plan.rows[0].interest, 50);
	near(plan.rows[0].capital, 393.21);
});

test("the opening fee raises the TAE but not the TIN", () => {
	const { tin, tae, plan } = analyzeFinancing({ ...loan, opening_fee: 200 });
	near(tin, 6);
	assert.ok(tae > 8);
	near(plan.totalCost, 837.04);
});

test("contract rates win over implied ones and flag a mismatch", () => {
	const same = analyzeFinancing({ ...loan, tin: 6, tae: 6.17 });
	assert.equal(same.tinIsImplied, false);
	assert.equal(same.ratesDiffer, false);
	const other = analyzeFinancing({ ...loan, tin: 4 });
	assert.equal(other.tin, 4);
	assert.equal(other.ratesDiffer, true);
});

test("zero-interest financing works", () => {
	const { tin, tae, plan } = analyzeFinancing({
		...loan,
		monthly_amount: 100,
		number_of_payments: 12,
		financed_amount: 1200,
	});
	assert.equal(tin, 0);
	assert.equal(tae, 0);
	assert.equal(plan.interest, 0);
});

test("a balloon payment is discounted at its own date", () => {
	const { tin, plan } = analyzeFinancing({
		...loan,
		monthly_amount: 200,
		number_of_payments: 36,
		final_payment: 5000,
		final_payment_date: "2029-01-15",
		financed_amount: 10500,
	});
	assert.equal(plan.rows.length, 37);
	assert.equal(plan.rows.at(-1).payment, 5000);
	assert.equal(plan.rows.at(-1).balance, 0);
	assert.ok(tin > 0);
});

test("uses the original plan after extras changed the installments", () => {
	const { tin } = analyzeFinancing({
		...loan,
		monthly_amount: 300,
		number_of_payments: 20,
		original_monthly_amount: 443.21,
		original_number_of_payments: 24,
	});
	near(tin, 6);
});

test("no plan without a financed amount or when it exceeds the payments", () => {
	const missing = analyzeFinancing({
		...loan,
		financed_amount: 0,
		tin: 6,
	});
	assert.equal(missing.plan, null);
	assert.equal(missing.tin, 6);
	assert.equal(missing.tae, null);
	const excess = analyzeFinancing({ ...loan, financed_amount: 20000 });
	assert.equal(excess.plan, null);
	assert.equal(excess.inconsistent, true);
});

test("outstanding capital follows paid installments and extras", () => {
	const { plan } = analyzeFinancing(loan);
	const paid = {
		debt_id: "car",
		year: 2026,
		month: 1,
		planned_amount: 443.21,
		actual_amount: 443.21,
		paid: true,
	};
	near(calculateOutstandingCapital(loan, plan, [paid]), 9606.79);
	near(
		calculateOutstandingCapital(loan, plan, [
			paid,
			{ ...paid, month: 2, is_extra_payment: true, actual_amount: 1000 },
		]),
		8606.79,
	);
	assert.equal(
		calculateOutstandingCapital(
			{ ...loan, completed_at: "2026-03-01" },
			plan,
			[],
		),
		0,
	);
});

test("suggested installment matches the French amortization formula", () => {
	near(suggestMonthlyAmount(10000, 6, 24, 0), 443.21);
	assert.equal(suggestMonthlyAmount(10000, 0, 24, 0), null);
	assert.equal(suggestMonthlyAmount(undefined, 6, 24, 0), null);
});

test("paying early saves interest, more when shortening the term", () => {
	const base = {
		capital: 10000,
		monthlyRate: 0.005,
		monthly: 443.21,
		installmentsLeft: 24,
		finalPayment: 0,
		lump: 2000,
	};
	const term = estimateInterestSaving({ ...base, mode: "term" });
	const amount = estimateInterestSaving({ ...base, mode: "amount" });
	assert.ok(amount > 0);
	assert.ok(term > amount);
	near(amount, 127.41, 1);
	assert.equal(
		estimateInterestSaving({ ...base, monthlyRate: 0, mode: "term" }),
		0,
	);
	assert.ok(
		estimateInterestSaving({
			...base,
			lump: 0,
			extraPerMonth: 100,
			mode: "term",
		}) > 0,
	);
});

test("summary weights the TAE, applies the user's share and counts gaps", () => {
	const shared = {
		...loan,
		id: "b",
		participants: [
			{ user_id: "owner", name: "", percent: 50 },
			{ user_id: "p", name: "", percent: 50 },
		],
		my_percent: 50,
	};
	const summary = calculateFinancingSummary([
		loan,
		shared,
		{ ...loan, id: "c", financed_amount: 0 },
	]);
	assert.equal(summary.included, 2);
	assert.equal(summary.missing, 1);
	near(summary.totalCost, 955.56);
	near(summary.averageTae, 6.17);
});
