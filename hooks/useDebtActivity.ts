"use client";

import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type DebtActivity } from "@/lib/types";

export function useDebtActivity(debtId: string | undefined, enabled = true) {
	return useQuery({
		// Nested under "payments" so every payment invalidation refreshes it.
		queryKey: ["payments", "activity", debtId],
		queryFn: async () => {
			const result = await pb
				.collection(COLLECTIONS.DEBT_ACTIVITY)
				.getList<DebtActivity>(1, 20, {
					filter: pb.filter("debt_id = {:debtId}", { debtId }),
					sort: "-created",
				});
			return result.items;
		},
		enabled: Boolean(debtId) && enabled,
	});
}
