import assert from "node:assert/strict";
import { test } from "node:test";
import {
	calculateBreakdown,
	calculateDebtStarts,
	calculateMetricsSummary,
	calculateUpcomingLoad,
	filterEvolutionRange,
} from "../../lib/metrics.ts";

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
const paid = (month, id = "car") => ({
	id: `${id}-${month}`,
	debt_id: id,
	year: 2026,
	month,
	planned_amount: 100,
	actual_amount: 100,
	paid: true,
});

test("summary reports the debt-free month and balance changes", () => {
	const summary = calculateMetricsSummary([debt], [paid(1), paid(2)], now);
	assert.equal(summary.remaining, 400);
	assert.equal(summary.changeFromLastMonth, 0);
	assert.equal(summary.changeFromLastYear, null);
	assert.equal(summary.debtFreePeriod, "2026-06");
	assert.equal(summary.monthsLeft, 3);
	assert.equal(summary.paidPercent, 33);
});

test("summary has no debt-free date once everything is completed", () => {
	const done = { ...debt, completed_at: "2026-02-20" };
	const summary = calculateMetricsSummary([done], [], now);
	assert.equal(summary.debtFreePeriod, null);
	assert.equal(summary.monthsLeft, null);
	assert.equal(summary.paidPercent, 100);
});

test("upcoming load skips paid months and halves split debts", () => {
	const shared = { ...debt, id: "sofa", collaborator_id: "partner" };
	const { points } = calculateUpcomingLoad(
		[debt, shared],
		[{ ...paid(4), id: "early" }],
		now,
	);
	assert.deepEqual(
		points.map((p) => [p.period, p.amount]),
		[
			["2026-04", 50],
			["2026-05", 150],
			["2026-06", 150],
		],
	);
});

test("relief is the first month installments go down, ignoring early payments", () => {
	const longer = { ...debt, id: "tv", number_of_payments: 8 };
	const { relief } = calculateUpcomingLoad(
		[debt, longer],
		[{ ...paid(5), id: "early" }],
		now,
	);
	assert.deepEqual(relief, { period: "2026-07", amount: 100 });
});

test("the last installment counts as relief and balloons do not", () => {
	const balloon = {
		...debt,
		final_payment: 1000,
		final_payment_date: "2026-08-15",
	};
	const { points, relief } = calculateUpcomingLoad([balloon], [], now);
	assert.equal(points.find((p) => p.period === "2026-08").amount, 1000);
	assert.deepEqual(relief, { period: "2026-07", amount: 100 });
});

test("completed debts add no upcoming load", () => {
	const done = { ...debt, completed_at: "2026-02-20" };
	assert.deepEqual(calculateUpcomingLoad([done], [], now), {
		points: [],
		relief: null,
	});
});

test("breakdown sorts by balance and merges entities", () => {
	const other = { ...debt, id: "tv", name: "TV", number_of_payments: 2 };
	const elsewhere = {
		...debt,
		id: "sofa",
		name: "Sofa",
		entity: " ",
		number_of_payments: 1,
	};
	const debts = [other, debt, elsewhere];
	assert.deepEqual(
		calculateBreakdown(debts, [], "debt").map((r) => [r.label, r.remaining]),
		[
			["Car", 600],
			["TV", 200],
			["Sofa", 100],
		],
	);
	assert.deepEqual(
		calculateBreakdown(debts, [], "entity").map((r) => [r.label, r.remaining]),
		[
			["Bank", 800],
			["", 100],
		],
	);
});

test("debt starts land on the month before the first payment", () => {
	assert.deepEqual(
		[...calculateDebtStarts([debt]).entries()],
		[["2025-12", ["Car"]]],
	);
});

test("range keeps the window around today and never returns too few", () => {
	const points = ["2025-01", "2026-02", "2026-03", "2026-04", "2027-06"].map(
		(period) => ({ period, remaining: 1, projected: period > "2026-03" }),
	);
	assert.deepEqual(
		filterEvolutionRange(points, 1, now).map((p) => p.period),
		["2026-02", "2026-03", "2026-04"],
	);
	assert.equal(filterEvolutionRange(points, null, now).length, 5);
	assert.equal(filterEvolutionRange(points.slice(0, 1), 1, now).length, 1);
});
