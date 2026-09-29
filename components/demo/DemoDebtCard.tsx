"use client";

import {
	CaretDownIcon,
	DotsThreeIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import DebtInfo from "@/components/dashboard/DebtInfo";
import DebtProgressWithPayments from "@/components/dashboard/DebtProgressWithPayments";
import { useCurrency } from "@/hooks/useCurrency";
import type { DebtSortKey } from "@/lib/debtSorting";
import {
	calculateDebtStatus,
	calculateRemainingAmountWithPayments,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import DemoDebtPaymentStatus from "./DemoDebtPaymentStatus";

interface DemoDebtCardProps {
	debt: Debt;
	payments: Payment[];
	sortBy?: DebtSortKey;
	onDebtClick: (debt: Debt) => void;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
}

export default function DemoDebtCard({
	debt,
	payments,
	sortBy,
	onDebtClick,
	onEdit,
	onDelete,
}: DemoDebtCardProps) {
	const t = useTranslations();
	const { formatCurrency } = useCurrency();
	const [expanded, setExpanded] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (!menuOpen) return;
		const closeOutside = (event: PointerEvent) => {
			if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
		};
		const closeEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") setMenuOpen(false);
		};
		document.addEventListener("pointerdown", closeOutside);
		document.addEventListener("keydown", closeEscape);
		return () => {
			document.removeEventListener("pointerdown", closeOutside);
			document.removeEventListener("keydown", closeEscape);
		};
	}, [menuOpen]);
	const handleCardClick = (event: MouseEvent<HTMLElement>) => {
		if (
			!(event.target as Element).closest("button, a, input, select, textarea")
		) {
			setExpanded((value) => !value);
		}
	};
	const debtPayments = payments.filter(
		(payment) => payment.debt_id === debt.id,
	);
	const amount =
		(sortBy === "monthly"
			? debt.monthly_amount
			: calculateRemainingAmountWithPayments(debt, debtPayments)) *
		(debt.collaborator_id ? 0.5 : 1);
	const completed = calculateDebtStatus(debt.completed_at) === "completed";

	return (
		<article
			onClick={handleCardClick}
			className={`relative rounded-xl border border-base-300 bg-base-100 ${completed ? "opacity-75" : ""}`}
		>
			<div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-1 gap-y-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] sm:gap-x-4 sm:px-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<button
							type="button"
							className="min-w-0 truncate text-left text-sm font-semibold hover:text-primary hover:underline sm:text-base"
							onClick={() => onDebtClick(debt)}
						>
							{debt.name}
						</button>
						{debt.is_shared && (
							<UsersThreeIcon
								size={16}
								className="shrink-0 text-secondary"
								aria-label={t("debt.shared.badge")}
							/>
						)}
					</div>
					<p className="truncate text-xs text-base-content/60">
						{debt.collaborator_id
							? t("collaboration.with", {
									name: debt.collaborator_name || t("collaboration.member"),
								})
							: debt.entity}
					</p>
				</div>
				<div className="col-start-1 row-start-2 min-w-0 sm:col-start-2 sm:row-start-1 sm:text-right">
					<p className="text-sm font-semibold tabular-nums text-primary sm:text-base">
						{formatCurrency(amount)}
					</p>
					<p className="text-xs text-base-content/60">
						{t(
							sortBy === "monthly"
								? debt.collaborator_id
									? "collaboration.yourMonthly"
									: "dashboard.debt.monthlyAmount"
								: debt.collaborator_id
									? "collaboration.yourRemaining"
									: "dashboard.debt.remainingAmount",
						)}
					</p>
				</div>
				<div className="col-span-2 col-start-2 row-start-2 justify-self-end sm:col-span-1 sm:col-start-3 sm:row-start-1">
					<DemoDebtPaymentStatus debt={debt} payments={debtPayments} compact />
				</div>
				<div
					ref={menuRef}
					className="relative col-start-2 row-start-1 sm:col-start-4"
				>
					<button
						type="button"
						className="btn btn-ghost btn-sm btn-square"
						aria-label={t("dashboard.debt.actions.label")}
						aria-expanded={menuOpen}
						onClick={() => setMenuOpen(!menuOpen)}
					>
						<DotsThreeIcon size={16} />
					</button>
					{menuOpen && (
						<div className="menu absolute right-0 top-full z-20 w-52 rounded-box bg-base-100 p-2 shadow">
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false);
									onDebtClick(debt);
								}}
							>
								{t("dashboard.debt.actions.viewDetails")}
							</button>
							<button
								type="button"
								onClick={() => {
									setMenuOpen(false);
									onEdit?.(debt);
								}}
							>
								{t("dashboard.debt.actions.edit")}
							</button>
							<button
								type="button"
								className="text-error"
								onClick={() => {
									setMenuOpen(false);
									onDelete?.(debt);
								}}
							>
								{t("dashboard.debt.actions.delete")}
							</button>
						</div>
					)}
				</div>
				<button
					type="button"
					className="btn btn-ghost btn-sm btn-square col-start-3 row-start-1 justify-self-end sm:col-start-5"
					aria-expanded={expanded}
					aria-label={`${t(expanded ? "dashboard.debt.collapse" : "dashboard.debt.expand")}: ${debt.name}`}
					onClick={() => setExpanded(!expanded)}
				>
					<CaretDownIcon size={18} className={expanded ? "rotate-180" : ""} />
				</button>
			</div>
			{expanded && (
				<div className="border-t border-base-300 p-3 sm:p-4">
					<DebtInfo debt={debt} payments={debtPayments} />
					<div className="mt-4">
						<DebtProgressWithPayments debt={debt} payments={debtPayments} />
					</div>
				</div>
			)}
		</article>
	);
}
