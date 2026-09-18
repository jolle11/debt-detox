import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDashboardMetrics } from "../../lib/dashboardWidgets.ts";
import { sortDebts } from "../../lib/debtSorting.ts";

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
		[{ ...debt, collaborator_id: "partner" }],
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
	const linked = { ...debt, collaborator_id: "partner" };
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
