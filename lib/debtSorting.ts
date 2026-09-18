import { parseDateOnly } from "@/lib/dateOnly";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import {
	calculatePaymentProgressWithPayments,
	calculateRemainingAmountWithPayments,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

export const DEBT_SORT_KEYS = [
	"pending",
	"remaining",
	"monthly",
	"end_date",
	"progress",
	"created",
	"name",
] as const;
export type DebtSortKey = (typeof DEBT_SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";
export interface DebtSortPreference {
	by: DebtSortKey;
	direction: SortDirection;
}

export const DEFAULT_SORT_DIRECTIONS: Record<DebtSortKey, SortDirection> = {
	pending: "asc",
	remaining: "desc",
	monthly: "desc",
	end_date: "asc",
	progress: "desc",
	created: "desc",
	name: "asc",
};

export function normalizeDebtSort(
	by: unknown,
	direction: unknown,
): DebtSortPreference {
	const key = DEBT_SORT_KEYS.includes(by as DebtSortKey)
		? (by as DebtSortKey)
		: "pending";
	return {
		by: key,
		direction:
			direction === "asc" || direction === "desc"
				? direction
				: DEFAULT_SORT_DIRECTIONS[key],
	};
}

function dateValue(value: string | undefined): number | null {
	if (!value) return null;
	const timestamp = Date.parse(value);
	return Number.isFinite(timestamp) ? timestamp : null;
}

function compareNumbers(
	left: number | null,
	right: number | null,
	direction: number,
): number {
	// Missing dates stay last in both directions.
	if (left === null) return right === null ? 0 : 1;
	if (right === null) return -1;
	return (left - right) * direction;
}

export function sortDebts(
	debts: Debt[],
	payments: Payment[],
	preference: DebtSortPreference,
	locale: string,
	now: Date = new Date(),
): Debt[] {
	const paymentsByDebt = new Map<string, Payment[]>();
	for (const payment of payments) {
		if (payment.deleted) continue;
		const entries = paymentsByDebt.get(payment.debt_id) ?? [];
		entries.push(payment);
		paymentsByDebt.set(payment.debt_id, entries);
	}
	const month = now.getFullYear() * 12 + now.getMonth();
	const collator = new Intl.Collator(locale, {
		numeric: true,
		sensitivity: "base",
	});
	const direction = preference.direction === "asc" ? 1 : -1;
	const rows = debts.map((debt) => {
		const records = paymentsByDebt.get(debt.id ?? "") ?? [];
		const first = parseDateOnly(debt.first_payment_date);
		const end = parseDateOnly(resolveFinalPaymentDate(debt));
		const scheduled =
			!debt.completed_at &&
			first &&
			end &&
			first <= now &&
			month <= end.getFullYear() * 12 + end.getMonth();
		const paid = records.some(
			(payment) =>
				payment.paid &&
				!payment.is_extra_payment &&
				payment.year === now.getFullYear() &&
				payment.month === now.getMonth() + 1,
		);
		return {
			debt,
			pending: scheduled ? (paid ? 1 : 0) : 2,
			end: end?.getTime() ?? null,
			created: dateValue(debt.created),
			remaining:
				calculateRemainingAmountWithPayments(debt, records) *
				(debt.collaborator_id ? 0.5 : 1),
			progress: debt.completed_at
				? 100
				: Math.min(
						100,
						calculatePaymentProgressWithPayments(debt, records).percentage,
					),
		};
	});

	rows.sort((left, right) => {
		let result = 0;
		switch (preference.by) {
			case "pending":
				// Debts without a current installment stay after payable/paid ones.
				result =
					compareNumbers(
						left.pending === 2 ? null : left.pending,
						right.pending === 2 ? null : right.pending,
						direction,
					) || compareNumbers(left.end, right.end, 1);
				break;
			case "remaining":
				result = (left.remaining - right.remaining) * direction;
				break;
			case "monthly":
				result =
					(left.debt.monthly_amount * (left.debt.collaborator_id ? 0.5 : 1) -
						right.debt.monthly_amount *
							(right.debt.collaborator_id ? 0.5 : 1)) *
					direction;
				break;
			case "end_date":
				result = compareNumbers(left.end, right.end, direction);
				break;
			case "progress":
				result = (left.progress - right.progress) * direction;
				break;
			case "created":
				result = compareNumbers(left.created, right.created, direction);
				break;
			case "name":
				result = collator.compare(left.debt.name, right.debt.name) * direction;
				break;
		}
		return (
			result ||
			collator.compare(left.debt.name, right.debt.name) ||
			(left.debt.id ?? "").localeCompare(right.debt.id ?? "")
		);
	});
	return rows.map(({ debt }) => debt);
}
