import { useTranslations } from "next-intl";
import DebtCard from "@/components/dashboard/debt-card";
import DebtFilterTabs from "@/components/dashboard/debt-filter-tabs";
import EmptyState from "@/components/dashboard/empty-state";
import { useDebtFilter } from "@/hooks/use-debt-filter";
import type { Debt } from "@/lib/types";

interface DebtsListProps {
	debts: Debt[];
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
}

export default function DebtsList({ debts, onEdit, onDelete }: DebtsListProps) {
	const t = useTranslations();
	const { activeFilter, setActiveFilter, filteredDebts, counts } =
		useDebtFilter(debts);

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5">
				<h2 className="card-title text-xl mb-4">
					{t("dashboard.title")}
				</h2>

				<DebtFilterTabs
					activeFilter={activeFilter}
					onFilterChange={setActiveFilter}
					counts={counts}
				/>

				<div className="space-y-4">
					{filteredDebts.map((debt) => (
						<DebtCard
							key={debt.id}
							debt={debt}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>

				{/* Empty state */}
				{filteredDebts.length === 0 && <EmptyState />}
			</div>
		</div>
	);
}
