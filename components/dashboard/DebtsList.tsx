import { useTranslations } from "next-intl";
import DebtCard from "@/components/dashboard/DebtCard";
import DebtFilterTabs from "@/components/dashboard/DebtFilterTabs";
import EmptyState from "@/components/dashboard/EmptyState";
import { useDebtFilter } from "@/hooks/useDebtFilter";
import type { MarkPaymentAsPaidFn } from "@/hooks/usePayments";
import type { Debt, Payment } from "@/lib/types";

interface DebtsListProps {
	debts: Debt[];
	payments: Payment[];
	onMarkPaymentAsPaid: MarkPaymentAsPaidFn;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onComplete?: (debt: Debt) => void;
	onAddDebt?: () => void;
}

export default function DebtsList({
	debts,
	payments,
	onMarkPaymentAsPaid,
	onEdit,
	onDelete,
	onComplete,
	onAddDebt,
}: DebtsListProps) {
	const t = useTranslations();
	const { activeFilter, setActiveFilter, filteredDebts, counts } =
		useDebtFilter(debts);

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-3 sm:p-5">
				<h2 className="card-title text-lg sm:text-xl mb-3 sm:mb-4">
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
							onMarkPaymentAsPaid={onMarkPaymentAsPaid}
							onEdit={onEdit}
							onDelete={onDelete}
							onComplete={onComplete}
						/>
					))}
				</div>

				{/* Empty state */}
				{filteredDebts.length === 0 && (
					<EmptyState filterType={activeFilter} onAddDebt={onAddDebt} />
				)}
			</div>
		</div>
	);
}
