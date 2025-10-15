"use client";

import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckCircleIcon, PlusCircle, DotsThree } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type DebtHeaderProps, debtStatusConfig } from "@/data/debtDetail";
import { calculateDebtStatus } from "@/lib/format";

export default function DebtHeader({
	debt,
	onEdit,
	onDelete,
	onComplete,
	onAddExtraPayment,
	onBack,
}: DebtHeaderProps) {
	const t = useTranslations();
	const status = calculateDebtStatus(debt.final_payment_date);
	const statusConfig = debtStatusConfig[status];

	return (
		<div className="flex items-center justify-between mb-4 gap-3">
			<div className="flex items-center gap-3 flex-1 min-w-0">
				<button onClick={onBack} className="btn btn-ghost btn-sm flex-shrink-0">
					<ArrowLeftIcon className="w-4 h-4" />
					<span className="hidden sm:inline">{t("common.back")}</span>
				</button>
				<div className="flex items-center gap-2 min-w-0 flex-1">
					<div className="min-w-0 flex-1">
						<h1 className="text-xl font-bold truncate">{debt.name}</h1>
						<p className="text-sm text-base-content/70 truncate">
							{debt.entity}
						</p>
					</div>
					{/* Desktop Action Buttons */}
					<div className="hidden md:flex items-center gap-1 flex-shrink-0">
						{status !== "completed" && (
							<>
								<button
									onClick={onAddExtraPayment}
									className="btn btn-ghost btn-sm text-primary hover:bg-primary/10"
									title={t("debt.extraPayment.title")}
								>
									<PlusCircle className="w-4 h-4" />
								</button>
								<button
									onClick={onComplete}
									className="btn btn-ghost btn-sm text-success hover:bg-success/10"
									title={t("debt.complete.title")}
								>
									<CheckCircleIcon className="w-4 h-4" />
								</button>
							</>
						)}
						<button
							onClick={onEdit}
							className="btn btn-ghost btn-sm"
							title={t("common.edit")}
						>
							<PencilIcon className="w-4 h-4" />
						</button>
						<button
							onClick={onDelete}
							className="btn btn-ghost btn-sm text-error hover:bg-error/10"
							title={t("common.delete")}
						>
							<TrashIcon className="w-4 h-4" />
						</button>
					</div>
					{/* Mobile Dropdown Menu */}
					<div className="dropdown dropdown-end md:hidden flex-shrink-0">
						<button tabIndex={0} className="btn btn-ghost btn-sm">
							<DotsThree className="w-5 h-5" weight="bold" />
						</button>
						<ul tabIndex={0} className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-300">
							{status !== "completed" && (
								<>
									<li>
										<button onClick={onAddExtraPayment} className="text-primary">
											<PlusCircle className="w-4 h-4" />
											{t("debt.extraPayment.title")}
										</button>
									</li>
									<li>
										<button onClick={onComplete} className="text-success">
											<CheckCircleIcon className="w-4 h-4" />
											{t("debt.complete.title")}
										</button>
									</li>
								</>
							)}
							<li>
								<button onClick={onEdit}>
									<PencilIcon className="w-4 h-4" />
									{t("common.edit")}
								</button>
							</li>
							<li>
								<button onClick={onDelete} className="text-error">
									<TrashIcon className="w-4 h-4" />
									{t("common.delete")}
								</button>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div className={`badge ${statusConfig.badge} flex-shrink-0`}>
				{t(statusConfig.key)}
			</div>
		</div>
	);
}
