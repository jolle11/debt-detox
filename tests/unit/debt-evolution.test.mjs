import assert from "node:assert/strict";
import { test } from "node:test";
import { calculateDashboardMetrics } from "../../lib/dashboardWidgets.ts";
import { calculateDebtEvolution } from "../../lib/debtEvolution.ts";

const now = new Date(2026, 2, 10);
const debt = {
	id: "car",
	user_id: "owner",
	name: "Car",
	entity: "Bank",
	first_payment_date: "2026-01-15",
	monthly_amount: 100,
	number_of_payments: 6,
};
const paid = (month, amount = 100, extra = false) => ({
	id: `${month}-${extra}`,
	debt_id: "car",
	year: 2026,
	month,
	planned_amount: extra ? 0 : 100,
	actual_amount: amount,
	paid: true,
	is_extra_payment: extra,
});

test("evolution starts at the full balance, follows payments and projects to zero", () => {
	const points = calculateDebtEvolution([debt], [paid(1), paid(2)], now);
	assert.deepEqual(
		points.map((p) => [p.period, p.remaining, p.projected]),
		[
			["2025-12", 600, false],
			["2026-01", 500, false],
			["2026-02", 400, false],
			["2026-03", 400, false],
			["2026-04", 200, true],
			["2026-05", 100, true],
			["2026-06", 0, true],
		],
	);
});

test("the current month matches the dashboard remaining debt", () => {
	const payments = [paid(1), paid(2), paid(3, 50, true)];
	const linked = { ...debt, collaborator_id: "partner" };
	const points = calculateDebtEvolution([linked], payments, now);
	const current = points.find((p) => p.period === "2026-03");
	assert.equal(
		current.remaining,
		calculateDashboardMetrics([linked], payments, now).remainingDebt,
	);
});

test("future debts appear at their start and completed debts drop to zero", () => {
	const future = { ...debt, id: "future", first_payment_date: "2026-06-15" };
	const done = { ...debt, completed_at: "2026-02-20" };
	const points = calculateDebtEvolution([done, future], [paid(1)], now);
	const at = (period) => points.find((p) => p.period === period).remaining;
	assert.equal(at("2026-02"), 0);
	assert.equal(at("2026-04"), 0);
	assert.equal(at("2026-05"), 600);
	assert.equal(at("2026-11"), 0);
});
