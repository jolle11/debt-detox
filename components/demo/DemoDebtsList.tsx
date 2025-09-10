import { useTranslations } from "next-intl";
import DebtFilterTabs from "@/components/dashboard/debt-filter-tabs";
import EmptyState from "@/components/dashboard/empty-state";
import { useDebtFilter } from "@/hooks/use-debt-filter";
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
						<DemoDebtCard
							key={debt.id}
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
