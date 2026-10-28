import PocketBase from "pocketbase";
import { resolveSharedCurrency } from "@/lib/sharedPresentation";
import { getShareRequestOptions } from "@/lib/shareRequest";
import type { Debt, Payment, SharedDebt, SharedProfile } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

export type ShareResult<T> =
	| { status: "ok"; data: T }
	| { status: "expired" }
	| { status: "unavailable" };

export interface SharedDebtData {
	share: SharedDebt;
	debt: Debt;
	payments: Payment[];
	currency: string;
}

export interface SharedProfileData {
	share: SharedProfile;
	debts: Debt[];
	payments: Payment[];
	currency: string;
	userName?: string;
}

// A fresh client per request so no auth state leaks between visitors.
function createServerClient() {
	const pb = new PocketBase(
		process.env.POCKETBASE_URL ||
			process.env.NEXT_PUBLIC_POCKETBASE_URL ||
			"http://127.0.0.1:8090",
	);
	pb.autoCancellation(false);
	return pb;
}

async function fetchOwner(
	pb: PocketBase,
	userId: string,
	token: string,
): Promise<{ currency: string; name?: string }> {
	try {
		const user = (await pb
			.collection("users")
			.getOne(userId, getShareRequestOptions(token))) as Record<
			string,
			unknown
		>;
		return {
			currency: resolveSharedCurrency(
				typeof user.currency === "string" ? user.currency : undefined,
			),
			name:
				typeof user.name === "string" && user.name.trim()
					? user.name
					: undefined,
		};
	} catch {
		// Owner metadata is optional for shared views.
		return { currency: resolveSharedCurrency(undefined) };
	}
}

export async function getSharedDebt(
	token: string,
): Promise<ShareResult<SharedDebtData>> {
	const pb = createServerClient();
	const options = getShareRequestOptions(token);

	let share: SharedDebt;
	try {
		const records = await pb
			.collection(COLLECTIONS.SHARED_DEBTS)
			.getList(1, 1, {
				...options,
				filter: pb.filter(
					"token = {:token} && deleted = null && expires_at > @now",
					{ token },
				),
			});
		if (records.items.length === 0) return { status: "expired" };
		share = records.items[0] as unknown as SharedDebt;
	} catch {
		return { status: "unavailable" };
	}

	const { currency } = await fetchOwner(pb, share.user_id, token);

	try {
		// Treat links to soft-deleted debts as expired.
		const debtRecords = await pb.collection(COLLECTIONS.DEBTS).getList(1, 1, {
			...options,
			filter: pb.filter("id = {:debtId} && deleted = null", {
				debtId: share.debt_id,
			}),
		});
		if (debtRecords.items.length === 0) return { status: "expired" };

		const payments = await pb.collection(COLLECTIONS.PAYMENTS).getFullList({
			...options,
			filter: pb.filter("debt_id = {:debtId} && deleted = null", {
				debtId: share.debt_id,
			}),
			sort: "-year,-month",
		});

		return {
			status: "ok",
			data: {
				share,
				debt: debtRecords.items[0] as unknown as Debt,
				payments: payments as unknown as Payment[],
				currency,
			},
		};
	} catch {
		return { status: "unavailable" };
	}
}

export async function getSharedProfile(
	token: string,
): Promise<ShareResult<SharedProfileData>> {
	const pb = createServerClient();
	const options = getShareRequestOptions(token);

	let share: SharedProfile;
	try {
		const records = await pb
			.collection(COLLECTIONS.SHARED_PROFILES)
			.getList(1, 1, {
				...options,
				filter: pb.filter(
					"token = {:token} && deleted = null && expires_at > @now",
					{ token },
				),
			});
		if (records.items.length === 0) return { status: "expired" };
		share = records.items[0] as unknown as SharedProfile;
	} catch {
		return { status: "unavailable" };
	}

	const { currency, name } = await fetchOwner(pb, share.user_id, token);

	try {
		const debts = (await pb.collection(COLLECTIONS.DEBTS).getFullList({
			...options,
			filter: pb.filter("user_id = {:userId} && deleted = null", {
				userId: share.user_id,
			}),
			sort: "-created",
		})) as unknown as Debt[];

		let payments: Payment[] = [];
		if (debts.length > 0) {
			payments = (await pb.collection(COLLECTIONS.PAYMENTS).getFullList({
				...options,
				filter: pb.filter("debt_id.user_id = {:userId} && deleted = null", {
					userId: share.user_id,
				}),
				sort: "-year,-month",
			})) as unknown as Payment[];
		}

		return {
			status: "ok",
			data: { share, debts, payments, currency, userName: name },
		};
	} catch {
		return { status: "unavailable" };
	}
}
