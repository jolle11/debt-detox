import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import { addMonthsToDateOnly } from "@/lib/dateOnly";

// The PocketBase hooks and the client must agree on the payment schedule.
const require = createRequire(import.meta.url);
const serverDates = require("../../pocketbase/pb_hooks/lib/dates.js");

test("client and server compute the same monthly schedule", () => {
	const starts = [
		"2024-01-31",
		"2024-01-29",
		"2023-11-30",
		"2025-12-15",
		"2024-02-29",
		"2026-03-31",
	];
	for (const start of starts) {
		for (let offset = 0; offset <= 36; offset++) {
			assert.equal(
				addMonthsToDateOnly(start, offset),
				serverDates.addMonthsToDateOnly(start, offset),
				`${start} + ${offset}`,
			);
		}
	}
});

test("month addition clamps to the end of shorter months", () => {
	assert.equal(addMonthsToDateOnly("2024-01-31", 1), "2024-02-29");
	assert.equal(addMonthsToDateOnly("2025-01-31", 1), "2025-02-28");
	assert.equal(addMonthsToDateOnly("2025-01-31", 2), "2025-03-31");
});
