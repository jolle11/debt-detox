"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedProfileView from "@/components/share/SharedProfileView";
import pb from "@/lib/pocketbase";
import type { Debt, Payment, SharedProfile } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

interface SharedProfileData {
	share: SharedProfile;
	debts: Debt[];
	payments: Payment[];
	userName?: string;
}

export default function ShareProfilePage() {
	const params = useParams();
	const token = params.token as string;
	const [data, setData] = useState<SharedProfileData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		async function fetchSharedProfile() {
			try {
				// Find the shared_profile record by token
				const shareRecords = await pb
					.collection(COLLECTIONS.SHARED_PROFILES)
					.getList(1, 1, {
						filter: `token = "${token}" && deleted = null && expires_at > @now`,
					});

				if (shareRecords.items.length === 0) {
					setIsExpired(true);
					setIsLoading(false);
					return;
				}

				const share = shareRecords.items[0] as unknown as SharedProfile;

				// Fetch user name
				let userName: string | undefined;
				try {
					const user = await pb.collection("users").getOne(share.user_id);
					userName = user.name || undefined;
				} catch {
					// User name is optional
				}

				// Fetch all debts for the user
				const debtRecords = await pb.collection(COLLECTIONS.DEBTS).getFullList({
					filter: `user_id = "${share.user_id}" && deleted = null`,
					sort: "-created",
				});

				const debts = debtRecords as unknown as Debt[];

				// Fetch all payments for all debts
				const debtIds = debts.map((d) => d.id).filter(Boolean);
				let allPayments: Payment[] = [];

				if (debtIds.length > 0) {
					const paymentFilter = debtIds
						.map((id) => `debt_id = "${id}"`)
						.join(" || ");
					const paymentRecords = await pb
						.collection(COLLECTIONS.PAYMENTS)
						.getFullList({
							filter: `(${paymentFilter}) && deleted = null`,
							sort: "-year,-month",
						});
					allPayments = paymentRecords as unknown as Payment[];
				}

				setData({
					share,
					debts,
					payments: allPayments,
					userName,
				});
			} catch {
				setIsExpired(true);
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

	if (isExpired || !data) {
		return <SharedDebtExpired />;
	}

	return (
		<SharedProfileView
			debts={data.debts}
			payments={data.payments}
			share={data.share}
			userName={data.userName}
		/>
	);
}
