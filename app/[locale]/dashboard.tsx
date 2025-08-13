"use client";
import { useTranslations, useLocale } from "next-intl";
import { mockDebts } from "@/lib/mock-data";
import StatCard from "@/components/dashboard/stat-card";
import DebtCard from "@/components/dashboard/debt-card";
import EmptyState from "@/components/dashboard/empty-state";
import DebtFilterTabs from "@/components/dashboard/debt-filter-tabs";
import { useDebtFilter } from "@/hooks/use-debt-filter";
import { MoneyIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from "@phosphor-icons/react";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();

	const debts = mockDebts;
	const { activeFilter, setActiveFilter, filteredDebts, counts } = useDebtFilter(debts);

	const activeDebts = debts.filter((d) => d.status === "active");
	const completedDebts = debts.filter((d) => d.status === "completed");

	const totalDebt = activeDebts.reduce((sum, debt) => sum + debt.currentAmount, 0);
	const totalMonthlyPayment = activeDebts.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
	const averageProgress = activeDebts.length > 0
		? Math.round(activeDebts.reduce((sum, debt) => sum + debt.progress, 0) / activeDebts.length)
		: 0;

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title={t("dashboard.stats.totalDebt")}
					value={`${t("common.currency")}${totalDebt.toLocaleString()}`}
					description={t("dashboard.stats.activeDebts", {
						count: activeDebts.length,
					})}
					icon={<MoneyIcon size={32} />}
					variant="primary"
				/>

				<StatCard
					title={t("dashboard.stats.monthlyPayment")}
					value={`${t("common.currency")}${totalMonthlyPayment}`}
					description={t("dashboard.stats.monthlyTotal")}
					icon={<ClockIcon size={32} />}
					variant="secondary"
				/>

				<StatCard
					title={t("dashboard.stats.completed")}
					value={completedDebts.length}
					description={t("dashboard.stats.paidOff")}
					icon={<CheckCircleIcon size={32} />}
					variant="accent"
				/>

				<StatCard
					title={t("dashboard.stats.averageProgress")}
					value={`${averageProgress}%`}
					description={t("dashboard.stats.ofAllDebts")}
					icon={<ChartBarIcon size={32} />}
					variant="info"
				/>
			</div>

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
