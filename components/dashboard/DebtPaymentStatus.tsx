"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { MarkPaymentAsPaidFn } from "@/hooks/usePayments";
import { calculateDebtLifecycleStatus } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

interface DebtPaymentStatusProps {
	debt: Debt;
	payments: Payment[];
	onMarkPaymentAsPaid: MarkPaymentAsPaidFn;
}

export default function DebtPaymentStatus({
	debt,
	payments,
	onMarkPaymentAsPaid,
}: DebtPaymentStatusProps) {
	const [isProcessing, setIsProcessing] = useState(false);
	const t = useTranslations("paymentStatus");

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
	const currentYear = currentDate.getFullYear();

	const getPaymentStatus = (
		debtId: string,
		month: number,
		year: number,
	): Payment | null => {
		return (
			payments.find(
				(p) => p.debt_id === debtId && p.month === month && p.year === year,
			) || null
		);
	};

	const currentPaymentStatus = debt.id
		? getPaymentStatus(debt.id, currentMonth, currentYear)
		: null;
	const isCurrentMonthPaid = currentPaymentStatus?.paid || false;
	const lifecycleStatus = calculateDebtLifecycleStatus(
		debt.final_payment_date,
		debt.first_payment_date,
		payments,
	);

	const handleMarkAsPaid = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isProcessing || !debt.id) return;

		setIsProcessing(true);
		try {
			await onMarkPaymentAsPaid(
				debt.id,
				currentMonth,
				currentYear,
				debt.monthly_amount,
				debt.monthly_amount,
			);
		} catch (error) {
			console.error("Error al marcar pago:", error);
			// Aquí podrías mostrar un toast de error
		} finally {
			setIsProcessing(false);
		}
	};

	// Verificar si la deuda ya está completada
	const isDebtCompleted = lifecycleStatus === "completed";

	if (isDebtCompleted) {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-success badge-lg">{t("completed")}</div>
			</div>
		);
	}

	// Verificar si aún no ha llegado la fecha del primer pago
	if (lifecycleStatus === "pending") {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-neutral badge-lg">{t("pendingStart")}</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			{isCurrentMonthPaid ? (
				<div className="badge badge-success badge-lg">{t("monthlyPaid")}</div>
			) : (
				<button
					onClick={handleMarkAsPaid}
					disabled={isProcessing}
					className="btn btn-primary btn-sm sm:btn-md"
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
