import { useTranslations } from "next-intl";
import DebtCard from "@/components/dashboard/DebtCard";
import DebtFilterTabs from "@/components/dashboard/DebtFilterTabs";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDebtFilter } from "@/hooks/useDebtFilter";
import type { Debt, Payment } from "@/lib/types";

interface DebtsListProps {
	debts: Debt[];
	payments: Payment[];
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onAddDebt?: () => void;
}

export default function DebtsList({
	debts,
	payments,
	onEdit,
	onDelete,
	onAddDebt,
}: DebtsListProps) {
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
							payments={payments}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					))}
				</div>

				{/* Empty state */}
				{filteredDebts.length === 0 && (
					<EmptyState
						filterType={activeFilter}
						onAddDebt={onAddDebt}
					/>
				)}
			</div>
		</div>
	);
}
