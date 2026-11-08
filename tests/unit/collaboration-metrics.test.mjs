import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDashboardMetrics } from "../../lib/dashboardWidgets.ts";
import { sortDebts } from "../../lib/debtSorting.ts";
import { percentagesFromIncomes } from "../../utils/debtCalculations.ts";

const now = new Date(2026, 8, 18);
const debt = {
	id: "shared",
	user_id: "owner",
	name: "Shared",
	entity: "Bank",
	first_payment_date: "2026-01-01",
	monthly_amount: 100,
	number_of_payments: 12,
	final_payment_date: "2026-12-01",
	is_shared: true,
};
const payments = [
	{
		id: "payment",
		debt_id: "shared",
		month: 9,
		year: 2026,
		planned_amount: 100,
		actual_amount: 100,
		paid: true,
	},
];

test("linked financing contributes each member's half to financial totals", () => {
	const metrics = calculateDashboardMetrics(
		[
			{
				...debt,
				participants: [
					{ user_id: "owner", name: "", percent: 50 },
					{ user_id: "partner", name: "", percent: 50 },
				],
				my_percent: 50,
			},
		],
		payments,
		now,
	);
	assert.equal(metrics.originalDebt, 600);
	assert.equal(metrics.remainingDebt, 550);
	assert.equal(metrics.totalPaid, 50);
	assert.equal(metrics.monthlyPayment, 50);
	assert.equal(metrics.paidThisMonth, 50);
	assert.equal(metrics.activeDebts, 1);
});
test("legacy unlinked sharing retains existing totals and half monthly contribution", () => {
	const metrics = calculateDashboardMetrics([debt], payments, now);
	assert.equal(metrics.originalDebt, 1200);
	assert.equal(metrics.remainingDebt, 1100);
	assert.equal(metrics.monthlyPayment, 50);
	assert.equal(metrics.paidThisMonth, 100);
});
test("remaining balance sorting compares personal contributions", () => {
	const personal = {
		...debt,
		id: "personal",
		is_shared: false,
		monthly_amount: 75,
	};
	const linked = {
		...debt,
		participants: [
			{ user_id: "owner", name: "", percent: 50 },
			{ user_id: "partner", name: "", percent: 50 },
		],
		my_percent: 50,
	};
	assert.deepEqual(
		sortDebts(
			[personal, linked],
			[],
			{ by: "remaining", direction: "asc" },
			"es",
			now,
		).map((d) => d.id),
		["shared", "personal"],
	);
});

test("custom splits apply the viewer's percentage to totals and installments", () => {
	const split = {
		...debt,
		participants: [
			{ user_id: "owner", name: "", percent: 60 },
			{ user_id: "partner", name: "", percent: 40 },
		],
		my_percent: 60,
	};
	const metrics = calculateDashboardMetrics([split], payments, now);
	assert.equal(metrics.monthlyPayment, 60);
	assert.equal(metrics.remainingDebt, 660);
	assert.equal(metrics.paidThisMonth, 60);
});

test("payments keep the split in force when they were made", () => {
	const split = {
		...debt,
		participants: [
			{ user_id: "owner", name: "", percent: 60 },
			{ user_id: "partner", name: "", percent: 40 },
		],
		my_percent: 60,
	};
	const metrics = calculateDashboardMetrics(
		[split],
		payments.map((payment) => ({ ...payment, my_percent: 50 })),
		now,
	);
	assert.equal(metrics.paidThisMonth, 50);
	assert.equal(metrics.remainingDebt, 660);
	assert.equal(metrics.totalPaid, 50);
});

test("incomes turn into proportional percentages that add up to 100", () => {
	assert.deepEqual(percentagesFromIncomes([3000, 2000]), [60, 40]);
	const three = percentagesFromIncomes([1, 1, 1]);
	assert.equal(Math.round(three.reduce((a, b) => a + b, 0) * 100) / 100, 100);
	assert.equal(percentagesFromIncomes([3000, 0]), null);
});
