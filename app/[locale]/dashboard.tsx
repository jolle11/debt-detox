"use client";
import { useTranslations, useLocale } from "next-intl";
import { mockDebts } from "@/lib/mock-data";
import StatCard from "@/components/dashboard/stat-card";
import DebtCard from "@/components/dashboard/debt-card";

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
					icon={
						<svg
							className="w-8 h-8"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
								clipRule="evenodd"
							/>
						</svg>
					}
					variant="primary"
				/>

				<StatCard
					title={t("dashboard.stats.monthlyPayment")}
					value={`${t("common.currency")}${totalMonthlyPayment}`}
					description={t("dashboard.stats.monthlyTotal")}
					icon={
						<svg
							className="w-8 h-8"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
								clipRule="evenodd"
							/>
						</svg>
					}
					variant="secondary"
				/>

				<StatCard
					title={t("dashboard.stats.completed")}
					value={completedDebts}
					description={t("dashboard.stats.paidOff")}
					icon={
						<svg
							className="w-8 h-8"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fillRule="evenodd"
								d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					}
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
					icon={
						<svg
							className="w-8 h-8"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
						</svg>
					}
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
