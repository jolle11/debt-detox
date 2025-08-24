"use client";

import { useState } from "react";
import { usePayments } from "@/hooks/usePayments";
import { useTranslations } from "next-intl";
import type { Debt } from "@/lib/types";

interface DebtPaymentStatusProps {
	debt: Debt;
	onPaymentUpdate?: () => void;
}

export default function DebtPaymentStatus({ debt, onPaymentUpdate }: DebtPaymentStatusProps) {
	const { markPaymentAsPaid, getPaymentStatus, isLoading } = usePayments(
		debt.id,
	);
	const [isProcessing, setIsProcessing] = useState(false);
	const t = useTranslations("paymentStatus");

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
	const currentYear = currentDate.getFullYear();

	const currentPaymentStatus = getPaymentStatus(
		debt.id!,
		currentMonth,
		currentYear,
	);
	const isCurrentMonthPaid = currentPaymentStatus?.paid || false;

	const handleMarkAsPaid = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isProcessing || !debt.id) return;

		setIsProcessing(true);
		try {
			await markPaymentAsPaid(
				debt.id,
				currentMonth,
				currentYear,
				debt.monthly_amount,
				debt.monthly_amount,
			);
			// Notify parent component to refresh its data
			onPaymentUpdate?.();
		} catch (error) {
			console.error("Error al marcar pago:", error);
			// Aquí podrías mostrar un toast de error
		} finally {
			setIsProcessing(false);
		}
	};

	// Verificar si la deuda ya está completada
	const debtEndDate = debt.final_payment_date ? new Date(debt.final_payment_date) : null;
	const isDebtCompleted = debtEndDate && currentDate > debtEndDate;

	if (isDebtCompleted) {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-success badge-lg">{t("completed")}</div>
			</div>
		);
	}

	// Verificar si aún no ha llegado la fecha del primer pago
	const firstPaymentDate = new Date(debt.first_payment_date);
	if (currentDate < firstPaymentDate) {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-neutral badge-lg">
					{t("pendingStart")}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			{isCurrentMonthPaid ? (
				<div className="badge badge-success badge-lg">
					{t("monthlyPaid")}
				</div>
			) : (
				<button
					onClick={handleMarkAsPaid}
					disabled={isProcessing || isLoading}
					className="btn btn-primary"
				>
					{isProcessing ? (
						<span className="loading loading-spinner loading-sm"></span>
					) : (
						t("markAsPaid")
					)}
				</button>
			)}
		</div>
	);
}
