"use client";

import { ArrowLeftIcon, PencilIcon, TrashIcon, CheckCircleIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type DebtHeaderProps, debtStatusConfig } from "@/data/debtDetail";
import { calculateDebtStatus } from "@/lib/format";

export default function DebtHeader({
	debt,
	onEdit,
	onDelete,
	onComplete,
	onBack,
}: DebtHeaderProps) {
	const t = useTranslations();
	const status = calculateDebtStatus(debt.final_payment_date);
	const statusConfig = debtStatusConfig[status];

	return (
		<div className="flex items-center justify-between mb-4">
			<div className="flex items-center gap-3">
				<button onClick={onBack} className="btn btn-ghost btn-sm">
					<ArrowLeftIcon className="w-4 h-4" />
					{t("common.back")}
				</button>
				<div className="flex items-center gap-2">
					<div>
						<h1 className="text-xl font-bold">{debt.name}</h1>
						<p className="text-sm text-base-content/70">
							{debt.entity}
						</p>
					</div>
					<div className="flex items-center gap-1">
						{status !== "completed" && (
							<button
								onClick={onComplete}
								className="btn btn-ghost btn-sm text-success hover:bg-success/10"
								title={t("debt.complete.title")}
							>
								<CheckCircleIcon className="w-4 h-4" />
							</button>
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
				</div>
			</div>
			<div className={`badge ${statusConfig.badge}`}>
				{t(statusConfig.key)}
			</div>
		</div>
	);
}
