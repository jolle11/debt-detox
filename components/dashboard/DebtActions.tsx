import { DotsThreeIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtActionsProps {
	debt: Debt;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onComplete?: (debt: Debt) => void;
}

export default function DebtActions({
	debt,
	onEdit,
	onDelete,
	onComplete,
}: DebtActionsProps) {
	const t = useTranslations();
	const status = calculateDebtStatus(debt.final_payment_date);

	const actions = [
		{
			key: "viewDetails",
			label: t("dashboard.debt.actions.viewDetails"),
			className: "",
		},
		...(status === "active"
			? [
					{
						key: "complete",
						label: t("dashboard.debt.actions.complete"),
						className: "text-success",
					},
				]
			: []),
		{
			key: "edit",
			label: t("dashboard.debt.actions.edit"),
			className: "",
		},
		{
			key: "delete",
			label: t("dashboard.debt.actions.delete"),
			className: "text-error",
		},
	];

	return (
		<div className="flex flex-row items-center gap-1">
			<div
				className={`badge badge-sm sm:badge-md ${
					status === "completed" ? "badge-success" : "badge-primary"
				}`}
			>
				{status === "completed"
					? t("dashboard.debt.status.completed")
					: t("dashboard.debt.status.active")}
			</div>

			<div className="dropdown dropdown-end">
				<label tabIndex={0} className="btn btn-ghost btn-xs sm:btn-sm">
					<DotsThreeIcon size={16} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
				>
					{actions.map((action) => (
						<li key={action.key}>
							<a
								className={action.className}
								onClick={() => {
									if (action.key === "edit" && onEdit) {
										onEdit(debt);
									} else if (action.key === "delete" && onDelete) {
										onDelete(debt);
									} else if (action.key === "complete" && onComplete) {
										onComplete(debt);
									}
								}}
							>
								{action.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
