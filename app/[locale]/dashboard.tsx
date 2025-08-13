"use client";
import { useTranslations, useLocale } from "next-intl";
import { mockDebts } from "@/lib/mock-data";
import StatCard from "@/components/dashboard/stat-card";
import DebtCard from "@/components/dashboard/debt-card";
import { MoneyIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from "@phosphor-icons/react";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();

	const debts = mockDebts;

	const totalDebt = debts
		.filter((d) => d.status === "active")
		.reduce((sum, debt) => sum + debt.currentAmount, 0);
	const totalMonthlyPayment = debts
		.filter((d) => d.status === "active")
		.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
	const completedDebts = debts.filter((d) => d.status === "completed").length;
	const activeDebts = debts.filter((d) => d.status === "active").length;

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title={t("dashboard.stats.totalDebt")}
					value={`${t("common.currency")}${totalDebt.toLocaleString()}`}
					description={t("dashboard.stats.activeDebts", {
						count: activeDebts,
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
					value={completedDebts}
					description={t("dashboard.stats.paidOff")}
					icon={<CheckCircleIcon size={32} />}
					variant="accent"
				/>

				<StatCard
					title={t("dashboard.stats.averageProgress")}
					value={`${
						activeDebts > 0
							? Math.round(
									debts
										.filter((d) => d.status === "active")
										.reduce(
											(sum, debt) => sum + debt.progress,
											0,
										) / activeDebts,
								)
							: 0
					}%`}
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

					{/* Filter tabs */}
					<div className="tabs tabs-boxed mb-6">
						<a className="tab tab-active">
							{t("dashboard.tabs.all")}
						</a>
						<a className="tab">{t("dashboard.tabs.active")}</a>
						<a className="tab">{t("dashboard.tabs.completed")}</a>
					</div>

					<div className="space-y-4">
						{debts.map((debt) => (
							<DebtCard key={debt.id} debt={debt} />
						))}
					</div>

					{/* Empty state */}
					{debts.length === 0 && (
						<div className="text-center py-12">
							<div className="text-6xl mb-4">📊</div>
							<h3 className="text-xl font-semibold mb-2">
								{t("dashboard.empty.title")}
							</h3>
							<p className="text-base-content/70 mb-4">
								{t("dashboard.empty.description")}
							</p>
							<button className="btn btn-primary">
								{t("dashboard.empty.addButton")}
							</button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
