"use client";

import { ClockCounterClockwise, XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { HistoricalPaymentInfo } from "@/hooks/useCreateDebt";
import { useCurrency } from "@/hooks/useCurrency";
import { usePayments } from "@/hooks/usePayments";

interface ConfirmHistoricalPaymentsModalProps {
	info: HistoricalPaymentInfo | null;
	isOpen: boolean;
	onClose: () => void;
}

export default function ConfirmHistoricalPaymentsModal({
	info,
	isOpen,
	onClose,
}: ConfirmHistoricalPaymentsModalProps) {
	const t = useTranslations();
	const { markMultiplePaymentsAsPaid } = usePayments(info?.debtId);
	const { formatCurrency } = useCurrency();
	const [isLoading, setIsLoading] = useState(false);

	if (!isOpen || !info) return null;

	const totalAmount = info.count * info.monthlyAmount;

	// Generar la lista de meses históricos con la fecha de pago correspondiente
	const startDate = new Date(info.firstPaymentDate);
	const paymentDay = startDate.getDate();
	const historicalMonths: Array<{
		month: number;
		year: number;
		paidDate: string;
	}> = [];
	for (let i = 0; i < info.count; i++) {
		const paymentDate = new Date(startDate);
		paymentDate.setMonth(paymentDate.getMonth() + i);
		// Ajustar el día de pago (por si el mes tiene menos días)
		paymentDate.setDate(
			Math.min(
				paymentDay,
				new Date(
					paymentDate.getFullYear(),
					paymentDate.getMonth() + 1,
					0,
				).getDate(),
			),
		);
		historicalMonths.push({
			month: paymentDate.getMonth() + 1,
			year: paymentDate.getFullYear(),
			paidDate: paymentDate.toISOString(),
		});
	}

	const handleConfirm = async () => {
		setIsLoading(true);
		try {
			const paymentData = historicalMonths.map(
				({ month, year, paidDate }) => ({
					month,
					year,
					plannedAmount: info.monthlyAmount,
					actualAmount: info.monthlyAmount,
					paidDate,
				}),
			);
			await markMultiplePaymentsAsPaid(info.debtId, paymentData);
			onClose();
		} catch (error) {
			console.error("Error marking historical payments:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSkip = () => {
		onClose();
	};

	return (
		<div className="modal modal-open">
			<div className="modal-box max-w-md">
				<div className="flex justify-between items-center mb-4 gap-2">
					<h3 className="text-lg font-bold flex items-center gap-2 flex-1 min-w-0">
						<ClockCounterClockwise
							size={24}
							className="text-info flex-shrink-0"
						/>
						<span className="truncate">
							{t("debt.historicalPayments.title")}
						</span>
					</h3>
					<button
						className="btn btn-sm btn-circle btn-ghost flex-shrink-0"
						onClick={handleSkip}
						disabled={isLoading}
					>
						<XIcon size={20} />
					</button>
				</div>

				<p className="text-base-content/80 mb-4">
					{t("debt.historicalPayments.description", {
						count: info.count,
						amount: formatCurrency(totalAmount),
					})}
				</p>

				{/* Lista de meses */}
				<div className="bg-base-200 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
					<div className="space-y-1">
						{historicalMonths.map(({ month, year }) => {
							const date = new Date(year, month - 1, 1);
							const monthName = date.toLocaleDateString(undefined, {
								month: "long",
								year: "numeric",
							});
							return (
								<div
									key={`${month}-${year}`}
									className="flex justify-between text-sm"
								>
									<span className="capitalize">{monthName}</span>
									<span className="font-mono text-base-content/70">
										{formatCurrency(info.monthlyAmount)}
									</span>
								</div>
							);
						})}
					</div>
				</div>

				<div className="modal-action flex-wrap gap-2">
					<button
						type="button"
						className="btn btn-ghost"
						onClick={handleSkip}
						disabled={isLoading}
					>
						{t("debt.historicalPayments.skip")}
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? (
							<span className="loading loading-spinner loading-sm"></span>
						) : (
							<ClockCounterClockwise size={20} />
						)}
						{t("debt.historicalPayments.confirm", {
							count: info.count,
						})}
					</button>
				</div>
			</div>
			<div className="modal-backdrop" onClick={handleSkip}></div>
		</div>
	);
}
