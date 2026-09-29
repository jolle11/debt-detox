import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import DebtFilterTabs from "@/components/dashboard/DebtFilterTabs";
import DebtSortControl from "@/components/dashboard/DebtSortControl";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDebtFilter } from "@/hooks/useDebtFilter";
import {
	DEFAULT_SORT_DIRECTIONS,
	type DebtSortPreference,
	sortDebts,
} from "@/lib/debtSorting";
import type { Debt, Payment } from "@/lib/types";
import DemoDebtCard from "./DemoDebtCard";

interface DemoDebtsListProps {
	debts: Debt[];
	payments: Payment[];
	onDebtClick: (debt: Debt) => void;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onAddDebt?: () => void;
}

export default function DemoDebtsList({
	debts,
	payments,
	onDebtClick,
	onEdit,
	onDelete,
	onAddDebt,
}: DemoDebtsListProps) {
	const t = useTranslations();
	const locale = useLocale();
	const [preference, setPreference] = useState<DebtSortPreference>({
		by: "pending",
		direction: "asc",
	});
	const { activeFilter, setActiveFilter, filteredDebts, counts } =
		useDebtFilter(debts);
	const sortedDebts = sortDebts(filteredDebts, payments, preference, locale);

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-3 sm:p-5">
				<h2 className="card-title text-lg sm:text-xl mb-3 sm:mb-4">
					{t("dashboard.title")}
				</h2>

				<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-4">
					<DebtFilterTabs
						activeFilter={activeFilter}
						onFilterChange={setActiveFilter}
						counts={counts}
					/>
					<DebtSortControl
						preference={preference}
						isSaving={false}
						onChange={async (next) => {
							setPreference((current) => ({
								...current,
								...next,
								direction:
									next.by && !next.direction
										? DEFAULT_SORT_DIRECTIONS[next.by]
										: (next.direction ?? current.direction),
							}));
						}}
					/>
				</div>

				<div className="space-y-2">
					{sortedDebts.map((debt) => (
						<DemoDebtCard
							key={debt.id}
							sortBy={preference.by}
							debt={debt}
							payments={payments}
							onDebtClick={onDebtClick}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>

				{filteredDebts.length === 0 && (
					<EmptyState filterType={activeFilter} onAddDebt={onAddDebt} />
				)}
			</div>
		</div>
	);
}
