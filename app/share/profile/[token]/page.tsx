"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedLinkUnavailable from "@/components/share/SharedLinkUnavailable";
import SharedProfileView from "@/components/share/SharedProfileView";
import pb from "@/lib/pocketbase";
import { getShareRequestOptions } from "@/lib/shareRequest";
import { resolveSharedCurrency } from "@/lib/sharedPresentation";
import type { Debt, Payment, SharedProfile } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

interface SharedProfileData {
	share: SharedProfile;
	debts: Debt[];
	payments: Payment[];
	currency: string;
	userName?: string;
}

export default function ShareProfilePage() {
	const params = useParams();
	const token = params.token as string;
	const [data, setData] = useState<SharedProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isExpired, setIsExpired] = useState(false);
	const [isUnavailable, setIsUnavailable] = useState(false);

	useEffect(() => {
		async function fetchSharedProfile() {
			const shareRequestOptions = getShareRequestOptions(token);
			let shareRecords;

			try {
				// Find the shared_profile record by token.
				shareRecords = await pb
					.collection(COLLECTIONS.SHARED_PROFILES)
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

			const share = shareRecords.items[0] as unknown as SharedProfile;
			let currency = "EUR";

			let userName: string | undefined;
			try {
				const user = (await pb
					.collection("users")
					.getOne(share.user_id)) as Record<string, unknown>;
				userName =
					typeof user.name === "string" && user.name.trim()
						? user.name
						: undefined;
				currency = resolveSharedCurrency(
					typeof user.currency === "string" ? user.currency : undefined,
				);
			} catch {
				// User metadata is optional for shared views.
			}

			try {
				const debtRecords = await pb.collection(COLLECTIONS.DEBTS).getFullList({
					...shareRequestOptions,
					filter: `user_id = "${share.user_id}" && deleted = null`,
					sort: "-created",
				});

				const debts = debtRecords as unknown as Debt[];
				const debtIds = debts.map((d) => d.id).filter(Boolean);
				let allPayments: Payment[] = [];

				if (debtIds.length > 0) {
					const paymentFilter = debtIds
						.map((id) => `debt_id = "${id}"`)
						.join(" || ");
					const paymentRecords = await pb
						.collection(COLLECTIONS.PAYMENTS)
						.getFullList({
							...shareRequestOptions,
							filter: `(${paymentFilter}) && deleted = null`,
							sort: "-year,-month",
						});
					allPayments = paymentRecords as unknown as Payment[];
				}

				setData({
					share,
					debts,
					payments: allPayments,
					currency,
					userName,
				});
			} catch {
				setIsUnavailable(true);
			} finally {
				setIsLoading(false);
			}
		}

		fetchSharedProfile();
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
		<SharedProfileView
			debts={data.debts}
			share={data.share}
			currency={data.currency}
			userName={data.userName}
		/>
	);
}
