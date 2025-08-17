"use client";

import { useState } from "react";
import { usePayments } from "@/hooks/usePayments";
import type { Debt } from "@/lib/types";

interface DebtPaymentStatusProps {
	debt: Debt;
}

export default function DebtPaymentStatus({ debt }: DebtPaymentStatusProps) {
	const { markPaymentAsPaid, getPaymentStatus, isLoading } = usePayments(
		debt.id,
	);
	const [isProcessing, setIsProcessing] = useState(false);

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
	const currentYear = currentDate.getFullYear();

	const currentPaymentStatus = getPaymentStatus(
		debt.id!,
		currentMonth,
		currentYear,
	);
	const isCurrentMonthPaid = currentPaymentStatus?.paid || false;

	const handleMarkAsPaid = async () => {
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
		} catch (error) {
			console.error("Error al marcar pago:", error);
			// Aquí podrías mostrar un toast de error
		} finally {
			setIsProcessing(false);
		}
	};

	// Verificar si la deuda ya está completada
	const debtEndDate = new Date(debt.final_payment_date);
	const isDebtCompleted = currentDate > debtEndDate;

	if (isDebtCompleted) {
		return (
			<div className="flex items-center gap-2 text-sm">
				<div className="badge badge-success">Completada</div>
			</div>
		);
	}

	// Verificar si aún no ha llegado la fecha del primer pago
	const firstPaymentDate = new Date(debt.first_payment_date);
	if (currentDate < firstPaymentDate) {
		return (
			<div className="flex items-center gap-2 text-sm">
				<div className="badge badge-neutral">Pendiente de inicio</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 text-sm">
			{isCurrentMonthPaid ? (
				<div className="badge badge-success">Mensualidad pagada</div>
			) : (
				<button
					onClick={handleMarkAsPaid}
					disabled={isProcessing || isLoading}
					className="btn btn-sm btn-primary"
				>
					{isProcessing ? (
						<span className="loading loading-spinner loading-xs"></span>
					) : (
						"Marcar como pagada"
					)}
				</button>
			)}
		</div>
	);
}
