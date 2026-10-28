import assert from "node:assert/strict";
import { test } from "node:test";
import {
	buildAnnualSummary,
	buildPaymentRows,
	buildPaymentsCsv,
} from "../../lib/exportDebts.ts";
import {
	calculateSavingsPlan,
	simulateExtraPayment,
	simulateMonthlyExtra,
} from "../../lib/simulator.ts";

const debt = {
	id: "car",
	user_id: "owner",
	name: 'Car, "red"',
	entity: "Bank",
	first_payment_date: "2026-01-15",
	monthly_amount: 100,
	number_of_payments: 10,
};
const stats = { registeredPaidPayments: 2, pendingAmount: 800 };

test("one-off extra payment previews both strategies like the server", () => {
	const result = simulateExtraPayment(debt, stats, 250);
	assert.equal(result.reduce_installments.remainingInstallments, 6);
	assert.equal(result.reduce_installments.totalInstallments, 8);
	assert.equal(result.reduce_amount.monthlyAmount, 68.75);
	assert.equal(result.none.remainingInstallments, 8);
});

test("a monthly extra shortens the payoff", () => {
	const result = simulateMonthlyExtra(800, 100, 8, 60, new Date(2026, 2, 10));
	assert.equal(result.months, 5);
	assert.equal(result.monthsSaved, 3);
	assert.equal(result.payoffDate, "2026-08-10");
	assert.equal(simulateMonthlyExtra(0, 100, 8, 60), null);
});

test("savings plan spreads the remaining goal over the months left", () => {
	const now = new Date(2026, 0, 10);
	assert.deepEqual(calculateSavingsPlan(1200, 300, "2026-10-15", now), {
		remaining: 900,
		monthsLeft: 9,
		monthlyNeeded: 100,
		progress: 25,
	});
	assert.equal(
		calculateSavingsPlan(500, 600, "2026-10-15", now).monthlyNeeded,
		0,
	);
	assert.equal(
		calculateSavingsPlan(500, 0, "2026-01-20", now).monthlyNeeded,
		500,
	);
});

test("export rows, annual summary and CSV escaping", () => {
	const payments = [
		{
			id: "1",
			debt_id: "car",
			year: 2025,
			month: 12,
			planned_amount: 100,
			actual_amount: 100,
			paid: true,
			paid_date: "2025-12-15 00:00:00.000Z",
		},
		{
			id: "2",
			debt_id: "car",
			year: 2026,
			month: 1,
			planned_amount: 0,
			actual_amount: 50,
			paid: true,
			is_extra_payment: true,
			paid_date: "2026-01-03",
		},
		{
			id: "3",
			debt_id: "car",
			year: 2026,
			month: 2,
			planned_amount: 100,
			actual_amount: 0,
			paid: false,
		},
		{
			id: "4",
			debt_id: "car",
			year: 2026,
			month: 3,
			planned_amount: 100,
			paid: true,
			deleted: "2026-03-01",
		},
		{
			id: "5",
			debt_id: "other",
			year: 2026,
			month: 3,
			planned_amount: 100,
			paid: true,
		},
	];
	const rows = buildPaymentRows([debt], payments);
	assert.equal(rows.length, 3);
	assert.deepEqual(
		buildAnnualSummary(rows).map((r) => [
			r.year,
			r.installments,
			r.extras,
			r.count,
		]),
		[
			[2025, 100, 0, 1],
			[2026, 0, 50, 1],
		],
	);
	const labels = new Proxy({}, { get: (_, key) => String(key) });
	const csv = buildPaymentsCsv(rows, labels);
	assert.ok(csv.startsWith("﻿debt,entity"));
	assert.ok(
		csv.includes(
			'"Car, ""red""",Bank,2025-12,installment,100.00,100.00,yes,2025-12-15',
		),
	);
});
