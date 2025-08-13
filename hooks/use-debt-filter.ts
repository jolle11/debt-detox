import { useMemo, useState } from "react";
import type { Debt } from "@/lib/mock-data";

export type DebtFilterType = "all" | "active" | "completed";

export function useDebtFilter(debts: Debt[]) {
	const [activeFilter, setActiveFilter] = useState<DebtFilterType>("all");

	const filteredDebts = useMemo(() => {
		switch (activeFilter) {
			case "active":
				return debts.filter((debt) => debt.status === "active");
			case "completed":
				return debts.filter((debt) => debt.status === "completed");
			case "all":
			default:
				return debts;
		}
	}, [debts, activeFilter]);

	const counts = useMemo(() => {
		return {
			all: debts.length,
			active: debts.filter((debt) => debt.status === "active").length,
			completed: debts.filter((debt) => debt.status === "completed")
				.length,
		};
	}, [debts]);

	return {
		activeFilter,
		setActiveFilter,
		filteredDebts,
		counts,
	};
}
