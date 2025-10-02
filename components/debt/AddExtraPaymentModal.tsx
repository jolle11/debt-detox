"use client";

import { PlusCircle, XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState, useMemo } from "react";
import { usePayments } from "@/hooks/usePayments";
import { useCurrency } from "@/hooks/useCurrency";
import type { Debt } from "@/lib/types";
import { calculatePaymentStats } from "@/utils/debtCalculations";

interface AddExtraPaymentModalProps {
	debt: Debt | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function AddExtraPaymentModal({
	debt,
	isOpen,
	onClose,
	onSuccess,
}: AddExtraPaymentModalProps) {
	const t = useTranslations();
	const { addExtraPayment, payments } = usePayments(debt?.id);
	const { formatCurrency } = useCurrency();
	const [amount, setAmount] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const maxAmount = useMemo(() => {
		if (!debt) return 0;
		const debtPayments = payments.filter((p) => p.debt_id === debt.id);
		const paymentStats = calculatePaymentStats(debt, debtPayments);
		return Math.max(0, paymentStats.pendingAmount);
	}, [debt, payments]);

	if (!isOpen || !debt) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const numAmount = parseFloat(amount);
		if (isNaN(numAmount) || numAmount <= 0) {
			setError(t("debt.extraPayment.invalidAmount"));
			return;
		}

		if (numAmount > maxAmount) {
			setError(
				t("debt.extraPayment.exceedsMaxAmount", {
					maxAmount: formatCurrency(maxAmount),
				}),
			);
			return;
		}

		setIsLoading(true);
		try {
			await addExtraPayment(debt.id!, numAmount);
			setAmount("");
			onSuccess?.();
			onClose();
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: t("debt.extraPayment.error"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setAmount("");
		setError(null);
		onClose();
	};

	return (
		<div className="modal modal-open">
			<div className="modal-box max-w-lg">
				<div className="flex justify-between items-center mb-4 gap-2">
					<h3 className="text-lg font-bold flex items-center gap-2 flex-1 min-w-0">
						<PlusCircle size={24} className="text-primary flex-shrink-0" />
						<span className="truncate">{t("debt.extraPayment.title")}</span>
					</h3>
					<button
						className="btn btn-sm btn-circle btn-ghost flex-shrink-0"
						onClick={handleClose}
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

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text">
								{t("debt.extraPayment.amountLabel")}
							</span>
							<span className="label-text-alt">
								{t("debt.extraPayment.maxAmount", {
									amount: formatCurrency(maxAmount),
								})}
							</span>
						</label>
						<input
							type="number"
							step="0.01"
							min="0.01"
							max={maxAmount}
							placeholder={t("debt.extraPayment.amountPlaceholder")}
							className="input input-bordered w-full"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							disabled={isLoading || maxAmount <= 0}
							required
						/>
						<label className="label">
							<span className="label-text-alt text-base-content/70 whitespace-normal break-words leading-relaxed">
								{t("debt.extraPayment.description")}
							</span>
						</label>
					</div>

					{maxAmount <= 0 && (
						<div className="alert alert-warning">
							<span>
								{t("debt.extraPayment.noRemainingAmount")}
							</span>
						</div>
					)}

					<div className="modal-action">
						<button
							type="button"
							className="btn btn-ghost"
							onClick={handleClose}
							disabled={isLoading}
						>
							{t("common.cancel")}
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isLoading}
						>
							{isLoading ? (
								<span className="loading loading-spinner loading-sm"></span>
							) : (
								<PlusCircle size={20} />
							)}
							{t("debt.extraPayment.confirm")}
						</button>
					</div>
				</form>
			</div>
			<div className="modal-backdrop" onClick={handleClose}></div>
		</div>
	);
}
