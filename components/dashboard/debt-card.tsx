import { useFormatter, useTranslations } from "next-intl";
import type { Debt } from "@/lib/mock-data";
import { DotsThreeIcon } from "@phosphor-icons/react";

interface DebtCardProps {
	debt: Debt;
}

export default function DebtCard({ debt }: DebtCardProps) {
	const t = useTranslations();
	const format = useFormatter();

	return (
		<div
			className={`card bg-base-100 shadow-lg ${debt.status === "completed" ? "opacity-75" : ""}`}
		>
			<div className="card-body">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h3 className="card-title text-lg">{debt.name}</h3>
						<p className="text-sm text-base-content/70 mb-2">
							{debt.entity}
						</p>

						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
							<div>
								<span className="font-semibold">
									{t("dashboard.debt.currentAmount")}:
								</span>
								<div className="text-lg font-bold text-primary">
									{t("common.currency")}
									{debt.currentAmount.toLocaleString()}
								</div>
							</div>
							<div>
								<span className="font-semibold">
									{t("dashboard.debt.initialAmount")}:
								</span>
								<div className="text-base-content/70">
									{t("common.currency")}
									{debt.initialAmount.toLocaleString()}
								</div>
							</div>
							<div>
								<span className="font-semibold">
									{t("dashboard.debt.monthlyPayment")}:
								</span>
								<div className="text-secondary">
									{t("common.currency")}
									{debt.monthlyPayment}
								</div>
							</div>
							<div>
								<span className="font-semibold">
									{t("dashboard.debt.endDate")}:
								</span>
								<div className="text-base-content/70">
									{format.dateTime(new Date(debt.endDate), {
										year: "numeric",
										month: "2-digit",
										day: "2-digit",
									})}
								</div>
							</div>
						</div>

						<div className="mt-4">
							<div className="flex justify-between text-sm mb-1">
								<span>{t("dashboard.debt.progress")}</span>
								<span>{debt.progress}%</span>
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
								? t("dashboard.debt.status.completed")
								: t("dashboard.debt.status.active")}
						</div>
						<div className="dropdown dropdown-end">
							<label
								tabIndex={0}
								className="btn btn-ghost btn-sm"
							>
								<DotsThreeIcon size={16} />
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
									<a>{t("dashboard.debt.actions.edit")}</a>
								</li>
								<li>
									<a className="text-error">
										{t("dashboard.debt.actions.delete")}
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
