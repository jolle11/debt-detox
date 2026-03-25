"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SharedDebtExpired from "@/components/share/SharedDebtExpired";
import SharedDebtView from "@/components/share/SharedDebtView";
import pb from "@/lib/pocketbase";
import type { Debt, Payment, SharedDebt } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

interface SharedData {
	share: SharedDebt;
	debt: Debt;
	payments: Payment[];
}

export default function SharePage() {
	const params = useParams();
	const token = params.token as string;
	const [data, setData] = useState<SharedData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isExpired, setIsExpired] = useState(false);

	useEffect(() => {
		async function fetchSharedDebt() {
			try {
				// Find the shared_debt record by token
				const shareRecords = await pb
					.collection(COLLECTIONS.SHARED_DEBTS)
					.getList(1, 1, {
						filter: `token = "${token}" && deleted = null && expires_at > @now`,
					});

				if (shareRecords.items.length === 0) {
					setIsExpired(true);
					setIsLoading(false);
					return;
				}

				const share = shareRecords.items[0] as unknown as SharedDebt;

				// Fetch the debt
				const debt = (await pb
					.collection(COLLECTIONS.DEBTS)
					.getOne(share.debt_id)) as unknown as Debt;

				// Fetch payments
				const paymentRecords = await pb
					.collection(COLLECTIONS.PAYMENTS)
					.getFullList({
						filter: `debt_id = "${share.debt_id}" && deleted = null`,
						sort: "-year,-month",
					});

				setData({
					share,
					debt,
					payments: paymentRecords as unknown as Payment[],
				});
			} catch {
				setIsExpired(true);
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

	if (isExpired || !data) {
		return <SharedDebtExpired />;
	}

	return (
		<SharedDebtView
			debt={data.debt}
			payments={data.payments}
			share={data.share}
		/>
	);
}
