import { DotsThreeIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";
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
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuId = useId();
	const { user } = useAuth();
	const canManage = !debt.collaborator_id || debt.user_id === user?.id;
	const status = calculateDebtStatus(debt.completed_at);

	useEffect(() => {
		if (!menuOpen) return;
		const closeOnOutsidePress = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
		};
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePress);
		document.addEventListener("keydown", closeOnEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOnOutsidePress);
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [menuOpen]);

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
				ref={menuRef}
				className="relative"
				onClick={(event) => event.stopPropagation()}
			>
				<button
					type="button"
					aria-label={t("dashboard.debt.actions.label")}
					aria-expanded={menuOpen}
					aria-controls={menuId}
					onClick={() => setMenuOpen((open) => !open)}
					className="btn btn-ghost btn-sm btn-square"
				>
					<DotsThreeIcon size={16} />
				</button>
				{menuOpen && (
					<ul
						id={menuId}
						className="menu absolute right-0 top-full z-20 w-52 rounded-box bg-base-100 p-2 shadow"
					>
						{actions
							.filter((action) => canManage || action.key === "viewDetails")
							.map((action) => (
								<li key={action.key}>
									{action.key === "viewDetails" ? (
										<Link
											href={`/debt/${debt.id}`}
											onClick={() => setMenuOpen(false)}
										>
											{action.label}
										</Link>
									) : (
										<button
											type="button"
											className={action.className}
											onClick={() => {
												setMenuOpen(false);
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
				)}
			</div>
		</div>
	);
}
