"use client";
import { useTranslations, useLocale, useFormatter } from "next-intl";
import LanguageSelector from "@/components/language-selector";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();
	const format = useFormatter();

	// Mock data - será reemplazado con datos reales de PocketBase
	const debts = [
		{
			id: 1,
			name: "Préstamo Personal Santander",
			entity: "Banco Santander",
			initialAmount: 10000,
			currentAmount: 7500,
			monthlyPayment: 350,
			endDate: "2025-12-31",
			progress: 25,
			status: "active",
		},
		{
			id: 2,
			name: "Tarjeta de Crédito BBVA",
			entity: "BBVA",
			initialAmount: 5000,
			currentAmount: 2800,
			monthlyPayment: 200,
			endDate: "2024-08-30",
			progress: 44,
			status: "active",
		},
		{
			id: 3,
			name: "Financiación Coche",
			entity: "Ford Credit",
			initialAmount: 15000,
			currentAmount: 0,
			monthlyPayment: 0,
			endDate: "2024-01-15",
			progress: 100,
			status: "completed",
		},
	];

	const totalDebt = debts
		.filter((d) => d.status === "active")
		.reduce((sum, debt) => sum + debt.currentAmount, 0);
	const totalMonthlyPayment = debts
		.filter((d) => d.status === "active")
		.reduce((sum, debt) => sum + debt.monthlyPayment, 0);
	const completedDebts = debts.filter((d) => d.status === "completed").length;
	const activeDebts = debts.filter((d) => d.status === "active").length;

	return (
		<div className="min-h-screen bg-base-100">
			{/* Header */}
			<div className="navbar bg-base-200 shadow-lg">
				<div className="flex-1">
					<h1 className="btn btn-ghost text-xl font-bold">
						{t("nav.title")}
					</h1>
				</div>
				<div className="flex-none flex gap-2">
					<LanguageSelector />
					<button className="btn btn-primary btn-sm">
						+ {t("nav.addDebt")}
					</button>
				</div>
			</div>

			<div className="container mx-auto p-6 space-y-6">
				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					<div className="stat bg-base-200 rounded-box shadow">
						<div className="stat-figure text-primary">
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
						</div>
						<div className="stat-title">
							{t("dashboard.stats.totalDebt")}
						</div>
						<div className="stat-value text-primary">
							{t("common.currency")}
							{totalDebt.toLocaleString()}
						</div>
						<div className="stat-desc">
							{t("dashboard.stats.activeDebts", {
								count: activeDebts,
							})}
						</div>
					</div>

					<div className="stat bg-base-200 rounded-box shadow">
						<div className="stat-figure text-secondary">
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
						</div>
						<div className="stat-title">
							{t("dashboard.stats.monthlyPayment")}
						</div>
						<div className="stat-value text-secondary">
							{t("common.currency")}
							{totalMonthlyPayment}
						</div>
						<div className="stat-desc">
							{t("dashboard.stats.monthlyTotal")}
						</div>
					</div>

					<div className="stat bg-base-200 rounded-box shadow">
						<div className="stat-figure text-accent">
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
						</div>
						<div className="stat-title">
							{t("dashboard.stats.completed")}
						</div>
						<div className="stat-value text-accent">
							{completedDebts}
						</div>
						<div className="stat-desc">
							{t("dashboard.stats.paidOff")}
						</div>
					</div>

					<div className="stat bg-base-200 rounded-box shadow">
						<div className="stat-figure text-info">
							<svg
								className="w-8 h-8"
								fill="currentColor"
								viewBox="0 0 20 20"
							>
								<path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
							</svg>
						</div>
						<div className="stat-title">
							{t("dashboard.stats.averageProgress")}
						</div>
						<div className="stat-value text-info">
							{activeDebts > 0
								? Math.round(
										debts
											.filter(
												(d) => d.status === "active",
											)
											.reduce(
												(sum, debt) =>
													sum + debt.progress,
												0,
											) / activeDebts,
									)
								: 0}
							%
						</div>
						<div className="stat-desc">
							{t("dashboard.stats.ofAllDebts")}
						</div>
					</div>
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
							<a className="tab">
								{t("dashboard.tabs.completed")}
							</a>
						</div>

						<div className="space-y-4">
							{debts.map((debt) => (
								<div
									key={debt.id}
									className={`card bg-base-100 shadow-lg ${debt.status === "completed" ? "opacity-75" : ""}`}
								>
									<div className="card-body">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h3 className="card-title text-lg">
													{debt.name}
												</h3>
												<p className="text-sm text-base-content/70 mb-2">
													{debt.entity}
												</p>

												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div>
														<span className="font-semibold">
															{t(
																"dashboard.debt.currentAmount",
															)}
															:
														</span>
														<div className="text-lg font-bold text-primary">
															{t(
																"common.currency",
															)}
															{debt.currentAmount.toLocaleString()}
														</div>
													</div>
													<div>
														<span className="font-semibold">
															{t(
																"dashboard.debt.initialAmount",
															)}
															:
														</span>
														<div className="text-base-content/70">
															{t(
																"common.currency",
															)}
															{debt.initialAmount.toLocaleString()}
														</div>
													</div>
													<div>
														<span className="font-semibold">
															{t(
																"dashboard.debt.monthlyPayment",
															)}
															:
														</span>
														<div className="text-secondary">
															{t(
																"common.currency",
															)}
															{
																debt.monthlyPayment
															}
														</div>
													</div>
													<div>
														<span className="font-semibold">
															{t(
																"dashboard.debt.endDate",
															)}
															:
														</span>
														<div className="text-base-content/70">
															{format.dateTime(
																new Date(
																	debt.endDate,
																),
																{
																	year: "numeric",
																	month: "2-digit",
																	day: "2-digit",
																},
															)}
														</div>
													</div>
												</div>

												{/* Progress bar */}
												<div className="mt-4">
													<div className="flex justify-between text-sm mb-1">
														<span>
															{t(
																"dashboard.debt.progress",
															)}
														</span>
														<span>
															{debt.progress}%
														</span>
													</div>
													<progress
														className={`progress ${debt.status === "completed" ? "progress-success" : "progress-primary"} w-full`}
														value={debt.progress}
														max="100"
													></progress>
												</div>
											</div>

											<div className="flex flex-col gap-2 ml-4">
												<div
													className={`badge ${debt.status === "completed" ? "badge-success" : "badge-primary"}`}
												>
													{debt.status === "completed"
														? t(
																"dashboard.debt.status.completed",
															)
														: t(
																"dashboard.debt.status.active",
															)}
												</div>
												<div className="dropdown dropdown-end">
													<label
														tabIndex={0}
														className="btn btn-ghost btn-sm"
													>
														<svg
															className="w-4 h-4"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
														</svg>
													</label>
													<ul
														tabIndex={0}
														className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
													>
														<li>
															<a>
																{t(
																	"dashboard.debt.actions.viewDetails",
																)}
															</a>
														</li>
														<li>
															<a>
																{t(
																	"dashboard.debt.actions.recordPayment",
																)}
															</a>
														</li>
														<li>
															<a>
																{t(
																	"dashboard.debt.actions.edit",
																)}
															</a>
														</li>
														<li>
															<a className="text-error">
																{t(
																	"dashboard.debt.actions.delete",
																)}
															</a>
														</li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</div>
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
		</div>
	);
}
