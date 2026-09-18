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
		saveSort: async (next: DebtSortPreference) => {
			await savePreferences({
				debt_sort_by: next.by,
				debt_sort_direction: next.direction,
			});
		},
	};
}
