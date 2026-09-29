import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	calculatePaymentProgressWithPayments,
	formatCurrency,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

interface DemoDebtPaymentStatusProps {
	debt: Debt;
	payments: Payment[];
	compact?: boolean;
}

export default function DemoDebtPaymentStatus({
	debt,
	payments,
	compact = false,
}: DemoDebtPaymentStatusProps) {
	const tPayment = useTranslations("paymentStatus");
	const tLanding = useTranslations("landing");
	const [showDemoAlert, setShowDemoAlert] = useState(false);

	const { paidPayments, totalPayments } = calculatePaymentProgressWithPayments(
		debt,
		payments,
	);
	const nextPaymentNumber = paidPayments + 1;

	const handleMarkAsPaid = () => {
		setShowDemoAlert(true);
		setTimeout(() => setShowDemoAlert(false), 3000);
	};

	if (paidPayments >= totalPayments) {
		return (
			<div
				className={
					compact
						? "badge badge-success badge-sm whitespace-nowrap"
						: "text-sm text-success font-medium"
				}
			>
				{tPayment(compact ? "completed" : "allPaymentsCompleted")}
			</div>
		);
	}

	if (compact) {
		const now = new Date();
		const currentPayment = payments.find(
			(payment) =>
				payment.year === now.getFullYear() &&
				payment.month === now.getMonth() + 1,
		);
		return currentPayment?.paid ? (
			<span className="badge badge-success badge-sm whitespace-nowrap">
				{tPayment("monthlyPaid")}
			</span>
		) : (
			<button
				type="button"
				className="btn btn-primary btn-sm whitespace-nowrap"
				onClick={handleMarkAsPaid}
			>
				{tPayment("payInstallment")}
			</button>
		);
	}

	return (
		<div className="space-y-2">
			{showDemoAlert && (
				<div className="alert alert-info alert-sm">
					<span className="text-xs">{tLanding("demo.readOnly")}</span>
				</div>
			)}

			<div className="flex items-center justify-between text-sm">
				<span className="text-base-content/70">
					{tPayment("nextPayment")} #{nextPaymentNumber}
				</span>
				<span className="font-medium">
					{formatCurrency(debt.monthly_amount)}
				</span>
			</div>

			<button
				onClick={handleMarkAsPaid}
				className="btn btn-primary"
				disabled={false}
			>
				{tPayment("markAsPaid")}
			</button>

			<div className="text-xs text-base-content/50">
				{paidPayments} / {totalPayments} {tPayment("paymentsCompleted")}
			</div>
		</div>
	);
}
