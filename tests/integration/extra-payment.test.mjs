import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { after, before, beforeEach, test } from "node:test";
import PocketBase from "pocketbase";

const IMAGE = "debt-detox-pocketbase:integration";
const CONTAINER = "debt-detox-pocketbase-integration";
const VOLUME = "debt-detox-pocketbase-integration-data";
const BASE_URL = "http://127.0.0.1:18094";
const SUPERUSER_EMAIL = "integration-admin@debt-detox.test";
const SUPERUSER_PASSWORD = "integration-admin-password";

let owner;
let otherUser;
let admin;
let ownerRecord;
let debt;

function docker(...args) {
	return execFileSync("docker", args, {
		cwd: process.cwd(),
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

async function waitForPocketBase() {
	for (let attempt = 0; attempt < 50; attempt++) {
		try {
			const response = await fetch(`${BASE_URL}/api/debt-detox/health`);
			if (response.ok) return;
		} catch {
			// The container is still starting.
		}
		await new Promise((resolve) => setTimeout(resolve, 100));
	}
	throw new Error("PocketBase integration container did not become healthy.");
}

function cleanup() {
	try {
		docker("rm", "-f", CONTAINER);
	} catch {
		// The container may not have been created.
	}
	try {
		docker("volume", "rm", "-f", VOLUME);
	} catch {
		// The volume may not have been created.
	}
}

before(async () => {
	cleanup();
	docker("build", "-q", "-t", IMAGE, "./pocketbase");
	docker("volume", "create", VOLUME);
	docker(
		"run",
		"--rm",
		"-v",
		`${VOLUME}:/pb/pb_data`,
		IMAGE,
		"./pocketbase",
		"superuser",
		"upsert",
		SUPERUSER_EMAIL,
		SUPERUSER_PASSWORD,
	);
	docker(
		"run",
		"-d",
		"--name",
		CONTAINER,
		"-p",
		"18094:8080",
		"-v",
		`${VOLUME}:/pb/pb_data`,
		IMAGE,
	);
	await waitForPocketBase();

	admin = new PocketBase(BASE_URL);
	await admin
		.collection("_superusers")
		.authWithPassword(SUPERUSER_EMAIL, SUPERUSER_PASSWORD);

	ownerRecord = await admin.collection("users").create({
		email: "owner@debt-detox.test",
		password: "owner-password",
		passwordConfirm: "owner-password",
	});

	owner = new PocketBase(BASE_URL);
	await owner
		.collection("users")
		.authWithPassword("owner@debt-detox.test", "owner-password");

	await admin.collection("users").create({
		email: "other@debt-detox.test",
		password: "other-password",
		passwordConfirm: "other-password",
	});
	otherUser = new PocketBase(BASE_URL);
	await otherUser
		.collection("users")
		.authWithPassword("other@debt-detox.test", "other-password");
});

beforeEach(async () => {
	debt = await admin.collection("debts").create({
		user_id: ownerRecord.id,
		name: "Integration debt",
		entity: "Integration lender",
		first_payment_date: "2026-01-15",
		monthly_amount: 100,
		number_of_payments: 12,
		original_monthly_amount: 100,
		original_number_of_payments: 12,
	});
});

after(() => {
	if (process.env.PB_TEST_DEBUG === "1") {
		console.log(docker("logs", CONTAINER));
	}
	cleanup();
});

test("owner can register an extra payment", async () => {
	const result = await owner.send(
		`/api/debt-detox/debts/${debt.id}/extra-payment`,
		{
			method: "POST",
			body: {
				amount: 250,
				strategy: "none",
			},
		},
	);

	assert.equal(result.payment.debt_id, debt.id);
	assert.equal(result.payment.actual_amount, 250);
	assert.equal(result.payment.is_extra_payment, true);
	assert.equal(result.debt.id, debt.id);
});

test("invalid strategy is rejected without creating a payment", async () => {
	const before = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}" && is_extra_payment = true`,
	});

	await assert.rejects(
		owner.send(`/api/debt-detox/debts/${debt.id}/extra-payment`, {
			method: "POST",
			body: {
				amount: 50,
				strategy: "unknown",
			},
		}),
		(error) => error?.status === 400,
	);

	const after = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}" && is_extra_payment = true`,
	});
	assert.equal(after.length, before.length);
});

test("reduce_amount keeps installments and reduces the monthly amount", async () => {
	const result = await owner.send(
		`/api/debt-detox/debts/${debt.id}/extra-payment`,
		{
			method: "POST",
			body: {
				amount: 200,
				strategy: "reduce_amount",
			},
		},
	);

	assert.equal(result.debt.number_of_payments, 12);
	assert.equal(result.debt.monthly_amount, 83.33);

	const persistedDebt = await owner.collection("debts").getOne(debt.id);
	assert.equal(persistedDebt.monthly_amount, 83.33);
});

test("reduce_installments keeps monthly amount and shortens the debt", async () => {
	const result = await owner.send(
		`/api/debt-detox/debts/${debt.id}/extra-payment`,
		{
			method: "POST",
			body: {
				amount: 250,
				strategy: "reduce_installments",
			},
		},
	);

	assert.equal(result.debt.monthly_amount, 100);
	assert.equal(result.debt.number_of_payments, 10);
	assert.equal(result.debt.final_payment_date.slice(0, 10), "2026-10-15");
});

test("another user cannot add a payment to someone else's debt", async () => {
	await assert.rejects(
		otherUser.send(`/api/debt-detox/debts/${debt.id}/extra-payment`, {
			method: "POST",
			body: {
				amount: 250,
				strategy: "none",
			},
		}),
		(error) => error?.status === 404,
	);

	const payments = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}"`,
	});
	assert.equal(payments.length, 0);
});

test("owner can complete a debt and all its monthly payments", async () => {
	await admin.collection("payments").create({
		debt_id: debt.id,
		month: 1,
		year: 2026,
		planned_amount: 100,
		paid: false,
		is_extra_payment: false,
	});

	const result = await owner.send(`/api/debt-detox/debts/${debt.id}/complete`, {
		method: "POST",
	});

	assert.equal(result.debt.id, debt.id);
	assert.equal(
		result.debt.final_payment_date.slice(0, 10),
		new Date().toISOString().slice(0, 10),
	);

	const payments = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}" && is_extra_payment = false`,
	});
	assert.equal(payments.length, 12);
	assert.equal(
		payments.every((payment) => payment.paid),
		true,
	);
});

test("completing a debt twice does not duplicate monthly payments", async () => {
	await owner.send(`/api/debt-detox/debts/${debt.id}/complete`, {
		method: "POST",
	});
	await owner.send(`/api/debt-detox/debts/${debt.id}/complete`, {
		method: "POST",
	});

	const payments = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}" && is_extra_payment = false`,
	});
	assert.equal(payments.length, 12);
});

test("completion preserves extra payments and creates the separate final payment", async () => {
	await admin.collection("debts").update(debt.id, {
		final_payment: 75,
		final_payment_date: "2027-01-15",
	});
	const extraPayment = await admin.collection("payments").create({
		debt_id: debt.id,
		month: 7,
		year: 2026,
		planned_amount: 0,
		actual_amount: 50,
		paid: true,
		paid_date: "2026-07-01",
		is_extra_payment: true,
	});

	await owner.send(`/api/debt-detox/debts/${debt.id}/complete`, {
		method: "POST",
	});

	const payments = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}"`,
	});
	const preservedExtra = payments.find(
		(payment) => payment.id === extraPayment.id,
	);
	const finalPayment = payments.find(
		(payment) =>
			!payment.is_extra_payment && payment.month === 1 && payment.year === 2027,
	);
	assert.equal(payments.length, 14);
	assert.equal(preservedExtra.actual_amount, 50);
	assert.equal(finalPayment.actual_amount, 75);
});

test("another user cannot complete someone else's debt", async () => {
	await assert.rejects(
		otherUser.send(`/api/debt-detox/debts/${debt.id}/complete`, {
			method: "POST",
		}),
		(error) => error?.status === 404,
	);

	const unchangedDebt = await owner.collection("debts").getOne(debt.id);
	const payments = await owner.collection("payments").getFullList({
		filter: `debt_id = "${debt.id}"`,
	});
	assert.equal(unchangedDebt.final_payment_date, "");
	assert.equal(payments.length, 0);
});
