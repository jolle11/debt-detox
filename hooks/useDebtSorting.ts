"use client";

import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import {
	type DebtSortPreference,
	normalizeDebtSort,
	sortDebts,
} from "@/lib/debtSorting";
import type { Debt, Payment } from "@/lib/types";

export function useDebtSorting(debts: Debt[], payments: Payment[]) {
	const { user, savePreferences, savingDebtSort } = useAuth();
	const locale = useLocale();
	const preference = normalizeDebtSort(
		user?.debt_sort_by,
		user?.debt_sort_direction,
	);
	return {
		preference,
		sortedDebts: sortDebts(debts, payments, preference, locale),
		isSaving: savingDebtSort,
		saveSort: async (next: Partial<DebtSortPreference>) => {
			await savePreferences({
				// Send only changed fields: a direction event may still hold the
				// previous render's criterion while its save is in flight.
				...(next.by !== undefined ? { debt_sort_by: next.by } : {}),
				...(next.direction !== undefined
					? { debt_sort_direction: next.direction }
					: {}),
			});
		},
	};
}
