"use client";

import { CheckCircleIcon, XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useCompleteDebt } from "@/hooks/useCompleteDebt";
import { usePayments } from "@/hooks/usePayments";
import type { Debt } from "@/lib/types";
import { calculateRemainingAmountWithPayments, formatCurrency } from "@/lib/format";

interface CompleteDebtModalProps {
	debt: Debt | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function CompleteDebtModal({
	debt,
	isOpen,
	onClose,
	onSuccess,
}: CompleteDebtModalProps) {
	const t = useTranslations();
	const { completeDebt, isLoading, error } = useCompleteDebt();
	const { payments } = usePayments();

	if (!isOpen || !debt) return null;

	const debtPayments = payments.filter((p) => p.debt_id === debt.id);
	const remainingAmount = calculateRemainingAmountWithPayments(debt, debtPayments);

	const handleConfirm = async () => {
		try {
			await completeDebt(debt, debtPayments);
			onSuccess?.();
			onClose();
		} catch (err) {
			// El error ya se maneja en el hook
		}
	};

	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold flex items-center gap-2">
						<CheckCircleIcon size={24} className="text-success" />
						{t("debt.complete.title")}
					</h3>
					<button
						className="btn btn-sm btn-circle btn-ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						<XIcon size={20} />
					</button>
				</div>

				{error && (
					<div className="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				)}

				<div className="space-y-4">
					<p>
						{t("debt.complete.confirmMessage", {
							name: debt.name,
							entity: debt.entity
						})}
					</p>

					{remainingAmount > 0 && (
						<div className="alert alert-info">
							<div className="flex flex-col">
								<p className="font-semibold">
									{t("debt.complete.remainingAmount")}
								</p>
								<p className="text-lg">
									{formatCurrency(remainingAmount)}
								</p>
								<p className="text-sm mt-2">
									{t("debt.complete.finalPaymentNote")}
								</p>
							</div>
						</div>
					)}

					<div className="modal-action">
						<button
							className="btn btn-ghost"
							onClick={onClose}
							disabled={isLoading}
						>
							{t("common.cancel")}
						</button>
						<button
							className="btn btn-success"
							onClick={handleConfirm}
							disabled={isLoading}
						>
							{isLoading ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : (
								<CheckCircleIcon size={20} />
							)}
							{t("debt.complete.confirm")}
						</button>
					</div>
				</div>
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</div>
	);
}