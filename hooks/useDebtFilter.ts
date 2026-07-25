import { useMemo, useState } from "react";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt } from "@/lib/types";

export type DebtFilterType = "all" | "active" | "completed";

export function useDebtFilter(debts: Debt[]) {
	const [activeFilter, setActiveFilter] = useState<DebtFilterType>("active");

	const filteredDebts = useMemo(() => {
		switch (activeFilter) {
			case "active":
				return debts.filter(
					(debt) => calculateDebtStatus(debt.completed_at) === "active",
				);
			case "completed":
				return debts.filter(
					(debt) => calculateDebtStatus(debt.completed_at) === "completed",
				);
			case "all":
			default:
				return debts;
		}
	}, [debts, activeFilter]);

	const counts = useMemo(() => {
		return {
			all: debts.length,
			active: debts.filter(
				(debt) => calculateDebtStatus(debt.completed_at) === "active",
			).length,
			completed: debts.filter(
				(debt) => calculateDebtStatus(debt.completed_at) === "completed",
			).length,
		};
	}, [debts]);

	return {
		activeFilter,
		setActiveFilter,
		filteredDebts,
		counts,
	};
}
