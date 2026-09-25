"use client";

import PrivateAmount from "@/components/ui/PrivateAmount";
import { CaretDownIcon, UsersThreeIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { type MouseEvent, useId, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import type { MarkPaymentAsPaidFn } from "@/hooks/usePayments";
import { Link } from "@/i18n/routing";
import {
	calculateDebtStatus,
	calculateRemainingAmountWithPayments,
} from "@/lib/format";
import type { DebtSortKey } from "@/lib/debtSorting";
import type { Debt, Payment } from "@/lib/types";
import DebtActions from "./DebtActions";
import DebtInfo from "./DebtInfo";
import DebtPaymentStatus from "./DebtPaymentStatus";
import DebtProgressWithPayments from "./DebtProgressWithPayments";

interface DebtCardProps {
	sortBy?: DebtSortKey;
	debt: Debt;
	payments: Payment[];
	onMarkPaymentAsPaid: MarkPaymentAsPaidFn;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onComplete?: (debt: Debt) => void;
}

export default function DebtCard({
	sortBy,
	debt,
	payments,
	onMarkPaymentAsPaid,
	onEdit,
	onDelete,
	onComplete,
}: DebtCardProps) {
	const t = useTranslations();
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const [expanded, setExpanded] = useState(false);
	const detailsId = useId();
	const status = calculateDebtStatus(debt.completed_at);
	const debtPayments = useMemo(
		() => payments.filter((p) => p.debt_id === debt.id),
		[payments, debt.id],
	);
	const remainingAmount = calculateRemainingAmountWithPayments(
		debt,
		debtPayments,
	);

	const handleCardClick = (event: MouseEvent<HTMLElement>) => {
		const target = event.target as Element;
		if (
			target.closest(
				"a, button, input, select, textarea, [role='button'], .dropdown",
			)
		) {
			return;
		}
		setExpanded((value) => !value);
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: the disclosure button provides equivalent keyboard interaction.
		// biome-ignore lint/a11y/noNoninteractiveElementInteractions: card clicks delegate to the accessible disclosure button without nesting interactive controls.
		<article
			onClick={handleCardClick}
			className={`relative focus-within:z-10 cursor-pointer rounded-xl border border-base-300 bg-base-100 transition-colors hover:border-primary/40 ${status === "completed" ? "opacity-75" : ""}`}
		>
			<div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-1 gap-y-2 p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_auto] sm:gap-x-4 sm:px-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="min-w-0 truncate text-sm font-semibold sm:text-base">
							<Link
								href={`/debt/${debt.id}`}
								className="hover:text-primary hover:underline"
								title={debt.name}
							>
								{debt.name}
							</Link>
						</h3>
						{debt.is_shared && (
							<span
								className="shrink-0 text-secondary"
								title={t("debt.shared.badge")}
							>
								<UsersThreeIcon size={16} aria-label={t("debt.shared.badge")} />
							</span>
						)}
					</div>
					<p className="truncate text-xs text-base-content/60">
						{debt.collaborator_id
							? t("collaboration.with", {
									name:
										debt.user_id === user?.id
											? debt.collaborator_name || t("collaboration.member")
											: debt.owner_name || t("collaboration.member"),
								})
							: debt.entity}
					</p>
				</div>

				<div className="col-start-1 row-start-2 min-w-0 sm:col-start-2 sm:row-start-1 sm:text-right">
					<p className="text-sm font-semibold tabular-nums text-primary sm:text-base">
						<PrivateAmount>
							{formatCurrency(
								(sortBy === "monthly" ? debt.monthly_amount : remainingAmount) *
									(debt.collaborator_id ? 0.5 : 1),
							)}
						</PrivateAmount>
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
					<DebtPaymentStatus
						debt={debt}
						payments={debtPayments}
						onMarkPaymentAsPaid={onMarkPaymentAsPaid}
						compact
					/>
				</div>

				<div className="col-start-2 row-start-1 sm:col-start-4">
					<DebtActions
						debt={debt}
						onEdit={onEdit}
						onDelete={onDelete}
						onComplete={onComplete}
						hideStatus
					/>
				</div>
				<button
					type="button"
					className="btn btn-ghost btn-sm btn-square col-start-3 row-start-1 justify-self-end sm:col-start-5"
					onClick={() => setExpanded((value) => !value)}
					aria-expanded={expanded}
					aria-controls={detailsId}
					aria-label={`${t(expanded ? "dashboard.debt.collapse" : "dashboard.debt.expand")}: ${debt.name}`}
				>
					<CaretDownIcon
						size={18}
						className={`transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
						aria-hidden="true"
					/>
				</button>
			</div>

			<div
				id={detailsId}
				hidden={!expanded}
				className="border-t border-base-300 p-3 sm:p-4"
			>
				{expanded && (
					<>
						<DebtInfo debt={debt} payments={debtPayments} />
						<div className="mt-4">
							<DebtProgressWithPayments debt={debt} payments={debtPayments} />
						</div>
					</>
				)}
			</div>
		</article>
	);
}
