import { DotsThreeIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "@/i18n/routing";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtActionsProps {
	debt: Debt;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onComplete?: (debt: Debt) => void;
	hideStatus?: boolean;
}

export default function DebtActions({
	debt,
	onEdit,
	onDelete,
	onComplete,
	hideStatus = false,
}: DebtActionsProps) {
	const t = useTranslations();
	const { user } = useAuth();
	const canManage = !debt.collaborator_id || debt.user_id === user?.id;
	const status = calculateDebtStatus(debt.completed_at);

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
			{!hideStatus && (
				<div
					className={`badge badge-sm sm:badge-md ${
						status === "completed" ? "badge-success" : "badge-primary"
					}`}
				>
					{status === "completed"
						? t("dashboard.debt.status.completed")
						: t("dashboard.debt.status.active")}
				</div>
			)}

			{/* Prevent card click handlers from handling menu selections. */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: interactive descendants handle keyboard input. */}
			<div
				className="dropdown dropdown-end"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					aria-label={t("dashboard.debt.actions.label")}
					className="btn btn-ghost btn-sm btn-square"
				>
					<DotsThreeIcon size={16} />
				</button>
				<ul
					tabIndex={0}
					className="dropdown-content menu z-20 p-2 shadow bg-base-100 rounded-box w-52"
				>
					{actions
						.filter((action) => canManage || action.key === "viewDetails")
						.map((action) => (
							<li key={action.key}>
								{action.key === "viewDetails" ? (
									<Link href={`/debt/${debt.id}`}>{action.label}</Link>
								) : (
									<button
										type="button"
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
									</button>
								)}
							</li>
						))}
				</ul>
			</div>
		</div>
	);
}
