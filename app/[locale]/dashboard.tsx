"use client";
import { useTranslations, useLocale } from "next-intl";
import { mockDebts } from "@/lib/mock-data";
import DebtCard from "@/components/dashboard/debt-card";
import EmptyState from "@/components/dashboard/empty-state";
import DebtFilterTabs from "@/components/dashboard/debt-filter-tabs";
import SummaryStats from "@/components/dashboard/summary-stats";
import { useDebtFilter } from "@/hooks/use-debt-filter";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();

	const debts = mockDebts;
	const { activeFilter, setActiveFilter, filteredDebts, counts } =
		useDebtFilter(debts);

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<SummaryStats debts={debts} />

			{/* Debt List */}
			<div className="card bg-base-200 shadow-xl">
				<div className="card-body">
					<h2 className="card-title text-2xl mb-4">
						{t("dashboard.title")}
					</h2>

					<DebtFilterTabs
						activeFilter={activeFilter}
						onFilterChange={setActiveFilter}
						counts={counts}
					/>

					<div className="space-y-4">
						{filteredDebts.map((debt) => (
							<DebtCard key={debt.id} debt={debt} />
						))}
					</div>

					{/* Empty state */}
					{filteredDebts.length === 0 && <EmptyState />}
				</div>
			</div>
		</div>
	);
}
