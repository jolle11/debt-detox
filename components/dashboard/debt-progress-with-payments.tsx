"use client";

import { usePayments } from "@/hooks/usePayments";
import {
	calculatePaidAmountWithPayments,
	calculatePaymentProgressWithPayments,
	calculateRemainingAmountWithPayments,
	calculateTotalAmount,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

interface DebtProgressWithPaymentsProps {
	debt: Debt;
	payments?: Payment[];
	isLoading?: boolean;
}

export default function DebtProgressWithPayments({
	debt,
	payments: externalPayments,
	isLoading: externalLoading = false,
}: DebtProgressWithPaymentsProps) {
	// Use external payments if provided, otherwise fetch them locally
	const { payments: localPayments, isLoading: localLoading } = usePayments(
		externalPayments ? undefined : debt.id,
	);

	const payments = externalPayments || localPayments;
	const isLoading = externalPayments ? externalLoading : localLoading;

	if (isLoading) {
		return (
			<div className="space-y-2">
				<div className="skeleton h-4 w-full"></div>
				<div className="skeleton h-3 w-3/4"></div>
			</div>
		);
	}

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmountWithPayments(debt, payments);
	const remainingAmount = calculateRemainingAmountWithPayments(
		debt,
		payments,
	);
	const progress = calculatePaymentProgressWithPayments(debt, payments);

	return (
		<div className="space-y-4">
			{/* Barra de progreso mejorada */}
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<div className="w-full bg-base-300 rounded-full h-4">
						<div
							className="bg-primary h-4 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
							style={{
								width: `${Math.max(progress.percentage, 5)}%`,
							}}
						>
							{progress.percentage > 15 && (
								<span className="text-sm font-medium text-primary-content">
									{progress.percentage}%
								</span>
							)}
						</div>
					</div>
				</div>
				{progress.percentage <= 15 && (
					<span className="text-lg font-semibold text-primary">
						{progress.percentage}%
					</span>
				)}
			</div>

			{/* Información de cuotas mejorada */}
			<div className="flex justify-between items-center">
				<span className="text-lg font-medium">
					Cuotas: {progress.paidPayments}/{progress.totalPayments}
				</span>
				<span className="text-base text-base-content/70">
					{progress.totalPayments - progress.paidPayments} restantes
				</span>
			</div>
		</div>
	);
}
