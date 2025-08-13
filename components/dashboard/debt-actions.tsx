import { DotsThreeIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { Debt } from "@/lib/mock-data";

interface DebtActionsProps {
	debt: Debt;
}

export default function DebtActions({ debt }: DebtActionsProps) {
	const t = useTranslations();

	const actions = [
		{
			key: "viewDetails",
			label: t("dashboard.debt.actions.viewDetails"),
			className: "",
		},
		{
			key: "recordPayment",
			label: t("dashboard.debt.actions.recordPayment"),
			className: "",
		},
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
		<div className="flex flex-col gap-2 ml-4">
			<div
				className={`badge ${
					debt.status === "completed"
						? "badge-success"
						: "badge-primary"
				}`}
			>
				{debt.status === "completed"
					? t("dashboard.debt.status.completed")
					: t("dashboard.debt.status.active")}
			</div>

			<div className="dropdown dropdown-end">
				<label tabIndex={0} className="btn btn-ghost btn-sm">
					<DotsThreeIcon size={16} />
				</label>
				<ul
					tabIndex={0}
					className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
				>
					{actions.map((action) => (
						<li key={action.key}>
							<a className={action.className}>{action.label}</a>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
