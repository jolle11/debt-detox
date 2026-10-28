"use client";

import { PlusCircle, XIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { usePayments } from "@/hooks/usePayments";
import { useToast } from "@/hooks/useToast";
import { simulateExtraPayment } from "@/lib/simulator";
import type { Debt, ExtraPaymentStrategy } from "@/lib/types";
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
	const locale = useLocale();
	const toast = useToast();
	const { addExtraPayment, payments } = usePayments(debt?.id);
	const { formatCurrency } = useCurrency();
	const [amount, setAmount] = useState<string>("");
	const [strategy, setStrategy] = useState<ExtraPaymentStrategy>("none");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const debtPayments = useMemo(() => {
		if (!debt) return [];
		return payments.filter((p) => p.debt_id === debt.id);
	}, [debt, payments]);

	const paymentStats = useMemo(() => {
		if (!debt) return null;
		return calculatePaymentStats(debt, debtPayments);
	}, [debt, debtPayments]);

	const maxAmount = useMemo(() => {
		if (!paymentStats) return 0;
		return Math.max(0, paymentStats.pendingAmount);
	}, [paymentStats]);

	// Preview de lo que pasará según la estrategia elegida
	const preview = useMemo(() => {
		if (!debt || !paymentStats) return null;

		const numAmount = parseFloat(amount);
		if (Number.isNaN(numAmount) || numAmount <= 0) return null;

		return {
			...simulateExtraPayment(debt, paymentStats, numAmount),
			originalMonthly: debt.original_monthly_amount || debt.monthly_amount,
			originalPayments:
				debt.original_number_of_payments || debt.number_of_payments,
		};
	}, [debt, paymentStats, amount]);

	if (!isOpen || !debt) return null;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		const numAmount = parseFloat(amount);
		if (Number.isNaN(numAmount) || numAmount <= 0) {
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
			await addExtraPayment(
				debt.id ?? "",
				numAmount,
				strategy,
				debt,
				debtPayments,
			);
			setAmount("");
			setStrategy("none");
			toast.success("extraPaymentAdded");
			onSuccess?.();
			onClose();
		} catch (err) {
			toast.error(
				"genericError",
				err instanceof Error ? err.message : t("debt.extraPayment.error"),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleClose = () => {
		setAmount("");
		setStrategy("none");
		setError(null);
		onClose();
	};

	const numAmount = parseFloat(amount);
	const hasValidAmount = !Number.isNaN(numAmount) && numAmount > 0;
	const showStrategies = hasValidAmount && numAmount <= maxAmount;

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
						<label htmlFor="extra-payment-amount" className="label">
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
							id="extra-payment-amount"
							type="number"
							lang={locale}
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
						<div className="label">
							<span className="label-text-alt text-base-content/70 whitespace-normal break-words leading-relaxed">
								{t("debt.extraPayment.description")}
							</span>
						</div>
					</div>

					{/* Selector de estrategia */}
					{showStrategies && (
						<div className="form-control">
							<div className="label">
								<span className="label-text font-semibold">
									{t("debt.extraPayment.strategyLabel")}
								</span>
							</div>
							<div className="space-y-2">
								{/* Opción 1: Solo registrar */}
								<label
									className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
										strategy === "none"
											? "border-primary bg-primary/5"
											: "border-base-300 hover:border-base-content/30"
									}`}
								>
									<input
										type="radio"
										name="strategy"
										className="radio radio-primary radio-sm mt-0.5"
										checked={strategy === "none"}
										onChange={() => setStrategy("none")}
										disabled={isLoading}
									/>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm">
											{t("debt.extraPayment.strategyNone")}
										</div>
										<div className="text-xs text-base-content/60 mt-0.5">
											{t("debt.extraPayment.strategyNoneDesc")}
										</div>
										{preview && (
											<div className="text-xs text-base-content/50 mt-1">
												{t("debt.extraPayment.previewInstallments", {
													amount: formatCurrency(preview.none.monthlyAmount),
													count: preview.none.remainingInstallments,
												})}
											</div>
										)}
									</div>
								</label>

								{/* Opción 2: Mantener importe, menos cuotas */}
								<label
									className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
										strategy === "reduce_installments"
											? "border-primary bg-primary/5"
											: "border-base-300 hover:border-base-content/30"
									}`}
								>
									<input
										type="radio"
										name="strategy"
										className="radio radio-primary radio-sm mt-0.5"
										checked={strategy === "reduce_installments"}
										onChange={() => setStrategy("reduce_installments")}
										disabled={isLoading}
									/>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm">
											{t("debt.extraPayment.strategyReduceInstallments")}
										</div>
										<div className="text-xs text-base-content/60 mt-0.5">
											{t("debt.extraPayment.strategyReduceInstallmentsDesc")}
										</div>
										{preview && (
											<div className="text-xs text-base-content/50 mt-1">
												{t("debt.extraPayment.previewInstallments", {
													amount: formatCurrency(
														preview.reduce_installments.monthlyAmount,
													),
													count:
														preview.reduce_installments.remainingInstallments,
												})}
											</div>
										)}
									</div>
								</label>

								{/* Opción 3: Mantener cuotas, menos importe */}
								<label
									className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
										strategy === "reduce_amount"
											? "border-primary bg-primary/5"
											: "border-base-300 hover:border-base-content/30"
									}`}
								>
									<input
										type="radio"
										name="strategy"
										className="radio radio-primary radio-sm mt-0.5"
										checked={strategy === "reduce_amount"}
										onChange={() => setStrategy("reduce_amount")}
										disabled={isLoading}
									/>
									<div className="flex-1 min-w-0">
										<div className="font-medium text-sm">
											{t("debt.extraPayment.strategyReduceAmount")}
										</div>
										<div className="text-xs text-base-content/60 mt-0.5">
											{t("debt.extraPayment.strategyReduceAmountDesc")}
										</div>
										{preview && (
											<div className="text-xs text-base-content/50 mt-1">
												{t("debt.extraPayment.previewInstallments", {
													amount: formatCurrency(
														preview.reduce_amount.monthlyAmount,
													),
													count: preview.reduce_amount.remainingInstallments,
												})}
											</div>
										)}
									</div>
								</label>
							</div>

							{/* Info valores originales */}
							{preview &&
								(debt.original_monthly_amount ||
									debt.original_number_of_payments) && (
									<div className="mt-2 text-xs text-base-content/50 flex items-center gap-1">
										<span>
											{t("debt.extraPayment.originalValues", {
												amount: formatCurrency(preview.originalMonthly),
												count: preview.originalPayments,
											})}
										</span>
									</div>
								)}
						</div>
					)}

					{maxAmount <= 0 && (
						<div className="alert alert-warning">
							<span>{t("debt.extraPayment.noRemainingAmount")}</span>
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
			{/* biome-ignore lint/a11y/noStaticElementInteractions: backdrop click is a pointer shortcut; the modal has its own close controls */}
			<div className="modal-backdrop" onClick={handleClose}></div>
		</div>
	);
}
