import assert from "node:assert/strict";
import { test } from "node:test";
import {
	calculateElapsedPayments,
	calculatePaymentStats,
} from "../../utils/debtCalculations.ts";

const futureDebt = {
	name: "Future",
	entity: "Bank",
	first_payment_date: "2999-01-15",
	monthly_amount: 100,
	number_of_payments: 12,
	original_monthly_amount: 100,
	original_number_of_payments: 12,
};

function payment(month, amount, extra = false) {
	return {
		debt_id: "debt",
		month,
		year: 2999,
		planned_amount: extra ? 0 : 100,
		actual_amount: amount,
		paid: true,
		is_extra_payment: extra,
	};
}

test("elapsed payments count only installments whose due day has passed", () => {
	const at = (y, m, d) => new Date(y, m - 1, d);
	assert.equal(calculateElapsedPayments("2026-01-15", 12, at(2026, 1, 20)), 0);
	assert.equal(calculateElapsedPayments("2026-01-15", 12, at(2026, 2, 15)), 0);
	assert.equal(calculateElapsedPayments("2026-01-15", 12, at(2026, 2, 16)), 1);
	assert.equal(calculateElapsedPayments("2026-01-15", 3, at(2030, 1, 1)), 3);
	assert.equal(calculateElapsedPayments("2026-01-15", 12, at(2025, 1, 1)), 0);
});

test("installments due on the 31st are due on the last day of short months", () => {
	const at = (y, m, d) => new Date(y, m - 1, d);
	assert.equal(calculateElapsedPayments("2026-01-31", 12, at(2026, 3, 1)), 1);
	assert.equal(calculateElapsedPayments("2026-01-31", 12, at(2026, 2, 28)), 0);
});

test("registered payments count at their actual amount, extras included", () => {
	const stats = calculatePaymentStats({ ...futureDebt, down_payment: 300 }, [
		payment(1, 100),
		payment(2, 120),
		payment(2, 50, true),
	]);
	assert.equal(stats.registeredPaidPayments, 2);
	assert.equal(stats.totalRegisteredAmount, 270);
	assert.equal(stats.effectivePaidAmount, 570);
	assert.equal(stats.pendingPayments, 10);
	assert.equal(stats.pendingAmount, 1500 - 570);
});

test("total amount uses the original plan after a reduction", () => {
	const stats = calculatePaymentStats(
		{ ...futureDebt, monthly_amount: 80, final_payment: 500 },
		[payment(1, 100, true)],
	);
	assert.equal(stats.pendingAmount, 1200 + 500 - 100);
});

test("paid amount never exceeds the debt total and pending never goes negative", () => {
	const stats = calculatePaymentStats(
		{ ...futureDebt, number_of_payments: 1 },
		[payment(1, 5000), payment(2, 100)],
	);
	assert.equal(stats.effectivePaidAmount, 1200);
	assert.equal(stats.pendingAmount, 0);
	assert.equal(stats.pendingPayments, 0);
});
