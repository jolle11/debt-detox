import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDebtSort, sortDebts } from "../../lib/debtSorting.ts";

const now = new Date(2026, 8, 18);
const debt = (id, overrides = {}) => ({
	id, user_id: "owner", name: id, entity: "Bank", first_payment_date: "2026-01-01",
	monthly_amount: 100, number_of_payments: 12, final_payment_date: "2026-12-01", ...overrides,
});
const payment = (debt_id, overrides = {}) => ({
	id: `payment-${debt_id}`, debt_id, month: 9, year: 2026, planned_amount: 100,
	actual_amount: 100, paid: true, ...overrides,
});
const ids = (debts, payments, by, direction = "asc") => sortDebts(debts, payments, {by, direction}, "es", now).map(d => d.id);

test("default preferences handle missing and invalid stored values", () => {
	assert.deepEqual(normalizeDebtSort(undefined, undefined), {by: "pending", direction: "asc"});
	assert.deepEqual(normalizeDebtSort("remaining", "invalid"), {by: "remaining", direction: "desc"});
	assert.deepEqual(normalizeDebtSort("invalid", "asc"), {by: "pending", direction: "asc"});
});

test("unpaid installments come first, then nearest end date; extras do not pay the installment", () => {
	const debts = [debt("paid"), debt("later"), debt("sooner", {number_of_payments: 10, final_payment_date: "2026-10-01"}), debt("future", {first_payment_date: "2027-01-01", final_payment_date: "2027-12-01"}), debt("completed", {completed_at: "2026-08-01"})];
	const payments = [payment("paid"), payment("sooner", {is_extra_payment: true}), payment("later", {deleted: "2026-09-01"})];
	assert.deepEqual(ids(debts, payments, "pending"), ["sooner", "later", "paid", "completed", "future"]);
	assert.deepEqual(ids(debts, payments, "pending", "desc"), ["paid", "sooner", "later", "completed", "future"]);
});

test("monthly status uses the selected month and excludes ended schedules", () => {
	const debts = [debt("last-month-paid"), debt("this-month-paid"), debt("ended", {number_of_payments: 2, final_payment_date: "2026-02-01"})];
	assert.deepEqual(ids(debts, [payment("last-month-paid", {month: 8}), payment("this-month-paid")], "pending"), ["last-month-paid", "this-month-paid", "ended"]);
	const october = sortDebts(debts, [payment("last-month-paid", {month: 10})], {by:"pending",direction:"asc"}, "es", new Date(2026,9,1));
	assert.equal(october[0].id, "this-month-paid");
});

test("remaining and progress use actual payments including extra payments", () => {
	const debts = [debt("a"), debt("b")];
	const payments = [payment("b", {actual_amount: 500, is_extra_payment: true})];
	assert.deepEqual(ids(debts,payments,"remaining"), ["b","a"]);
	assert.deepEqual(ids(debts,payments,"remaining","desc"), ["a","b"]);
	assert.deepEqual(ids(debts,payments,"progress","desc"), ["b","a"]);
	assert.deepEqual(ids(debts,payments,"progress"), ["a","b"]);
});

test("monthly amount and end date support both directions, including derived final dates", () => {
	const debts = [debt("big",{monthly_amount:200}),debt("small",{monthly_amount:50,number_of_payments:3,final_payment_date:undefined})];
	for (const by of ["monthly","end_date"]) {
		assert.deepEqual(ids(debts,[],by),["small","big"]);
		assert.deepEqual(ids(debts,[],by,"desc"),["big","small"]);
	}
});

test("creation dates keep missing values last; name sorting is natural and locale aware", () => {
	const debts = [debt("old",{created:"2025-01-01",name:"Álbum 2"}),debt("new",{created:"2026-01-01",name:"Álbum 10"}),debt("missing",{name:"Zeta"})];
	assert.deepEqual(ids(debts,[],"created","desc"),["new","old","missing"]);
	assert.deepEqual(ids(debts,[],"created"),["old","new","missing"]);
	assert.deepEqual(ids(debts,[],"name"),["old","new","missing"]);
	assert.deepEqual(ids(debts,[],"name","desc"),["missing","new","old"]);
});

test("sorting is stable for equal values, does not mutate inputs, and works on completed-only filters", () => {
	const debts = [debt("b",{completed_at:"2026-09-01",name:"Same"}),debt("a",{completed_at:"2026-09-01",name:"Same"})];
	const original = structuredClone(debts);
	assert.deepEqual(ids(debts,[],"progress","desc"),["a","b"]);
	assert.deepEqual(debts,original);
	assert.deepEqual(ids([],[],"pending"),[]);
});
