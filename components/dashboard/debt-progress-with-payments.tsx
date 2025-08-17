"use client";

import { usePayments } from "@/hooks/usePayments";
import {
	calculatePaidAmountWithPayments,
	calculatePaymentProgressWithPayments,
	calculateRemainingAmountWithPayments,
	calculateTotalAmount,
} from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtProgressWithPaymentsProps {
	debt: Debt;
}

export default function DebtProgressWithPayments({
	debt,
}: DebtProgressWithPaymentsProps) {
	const { payments, isLoading } = usePayments(debt.id);

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
		<div className="space-y-2">
			{/* Barra de progreso */}
			<div className="flex items-center gap-2">
				<div className="flex-1">
					<div className="w-full bg-base-300 rounded-full h-2">
						<div
							className="bg-primary h-2 rounded-full transition-all duration-300"
							style={{ width: `${progress.percentage}%` }}
						></div>
					</div>
				</div>
				<span className="text-sm font-medium text-base-content/80">
					{progress.percentage}%
				</span>
			</div>

			{/* Información de cuotas */}
			<div className="flex justify-between text-xs text-base-content/60">
				<span>
					Cuotas: {progress.paidPayments}/{progress.totalPayments}
				</span>
			</div>
		</div>
	);
}
