"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
	const t = useTranslations("debtProgress");
	const [animatedPercentage, setAnimatedPercentage] = useState(0);

	// Use external payments if provided, no local fetch needed
	const payments = externalPayments || [];
	const isLoading = externalLoading;

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmountWithPayments(debt, payments);
	const remainingAmount = calculateRemainingAmountWithPayments(
		debt,
		payments,
	);
	const progress = calculatePaymentProgressWithPayments(debt, payments);

	// Check if we have unrealistic data (indicates initial calculation issue)
	const hasValidData = paidAmount <= totalAmount * 1.1; // Allow 10% margin for rounding

	// Use validated progress data
	const validatedProgress = {
		...progress,
		percentage:
			!hasValidData || isNaN(progress.percentage)
				? 0
				: Math.min(progress.percentage, 100),
	};

	// Animate from 0 to final percentage when data is valid
	useEffect(() => {
		if (hasValidData && validatedProgress.percentage > 0) {
			const timer = setTimeout(() => {
				setAnimatedPercentage(validatedProgress.percentage);
			}, 100); // Small delay to ensure smooth animation
			return () => clearTimeout(timer);
		} else {
			setAnimatedPercentage(0);
		}
	}, [hasValidData, validatedProgress.percentage]);

	if (isLoading) {
		return (
			<div className="space-y-2">
				<div className="skeleton h-4 w-full"></div>
				<div className="skeleton h-3 w-3/4"></div>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Barra de progreso mejorada */}
			<div className="flex items-center gap-4">
				<div className="flex-1">
					<div className="w-full bg-base-300 rounded-full h-4">
						<div
							className="bg-primary h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
							style={{
								width: `${animatedPercentage > 0 ? Math.max(animatedPercentage, 5) : 0}%`,
							}}
						>
							{animatedPercentage > 15 && (
								<span className="text-sm font-medium text-primary-content">
									{Math.round(animatedPercentage)}%
								</span>
							)}
						</div>
					</div>
				</div>
				{animatedPercentage <= 15 && (
					<span className="text-lg font-semibold text-primary">
						{Math.round(animatedPercentage)}%
					</span>
				)}
			</div>

			{/* Información de cuotas mejorada */}
			<div className="flex justify-between items-center">
				<span className="text-lg font-medium">
					{t("paymentsLabel")}: {progress.paidPayments}/
					{progress.totalPayments}
				</span>
				<span className="text-base text-base-content/70">
					{progress.totalPayments - progress.paidPayments}{" "}
					{t("remaining")}
				</span>
			</div>
		</div>
	);
}
