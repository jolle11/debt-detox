"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedLinkUnavailable from "@/components/share/SharedLinkUnavailable";
import SharedDebtView from "@/components/share/SharedDebtView";
import pb from "@/lib/pocketbase";
import { getShareRequestOptions } from "@/lib/shareRequest";
import { resolveSharedCurrency } from "@/lib/sharedPresentation";
import type { Debt, Payment, SharedDebt } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

interface SharedData {
	share: SharedDebt;
	debt: Debt;
	payments: Payment[];
	currency: string;
}

export default function SharePage() {
	const params = useParams();
	const token = params.token as string;
	const [data, setData] = useState<SharedData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isExpired, setIsExpired] = useState(false);
	const [isUnavailable, setIsUnavailable] = useState(false);

	useEffect(() => {
		async function fetchSharedDebt() {
			const shareRequestOptions = getShareRequestOptions(token);
			let shareRecords;

			try {
				// Find the shared_debt record by token.
				shareRecords = await pb
					.collection(COLLECTIONS.SHARED_DEBTS)
					.getList(1, 1, {
						filter: `token = "${token}" && deleted = null && expires_at > @now`,
					});
			} catch {
				setIsUnavailable(true);
				setIsLoading(false);
				return;
			}

			if (shareRecords.items.length === 0) {
				setIsExpired(true);
				setIsLoading(false);
				return;
			}

			const share = shareRecords.items[0] as unknown as SharedDebt;
			let currency = "EUR";

			try {
				const user = (await pb
					.collection("users")
					.getOne(share.user_id)) as Record<string, unknown>;
				currency = resolveSharedCurrency(
					typeof user.currency === "string" ? user.currency : undefined,
				);
			} catch {
				// Currency falls back to the shared default.
			}

			try {
				// Treat links to soft-deleted debts as expired.
				const debtRecords = await pb
					.collection(COLLECTIONS.DEBTS)
					.getList(1, 1, {
						...shareRequestOptions,
						filter: pb.filter("id = {:debtId} && deleted = null", {
							debtId: share.debt_id,
						}),
					});

				if (debtRecords.items.length === 0) {
					setIsExpired(true);
					return;
				}

				const debt = debtRecords.items[0] as unknown as Debt;

				const paymentRecords = await pb
					.collection(COLLECTIONS.PAYMENTS)
					.getFullList({
						...shareRequestOptions,
						filter: `debt_id = "${share.debt_id}" && deleted = null`,
						sort: "-year,-month",
					});

				setData({
					share,
					debt,
					payments: paymentRecords as unknown as Payment[],
					currency,
				});
			} catch {
				setIsUnavailable(true);
			} finally {
				setIsLoading(false);
			}
		}

		fetchSharedDebt();
	}, [token]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<span className="loading loading-spinner loading-lg text-primary"></span>
			</div>
		);
	}

	if (isUnavailable) {
		return <SharedLinkUnavailable />;
	}

	if (isExpired || !data) {
		return <SharedDebtExpired />;
	}

	return (
		<SharedDebtView
			debt={data.debt}
			payments={data.payments}
			share={data.share}
			currency={data.currency}
		/>
	);
}
