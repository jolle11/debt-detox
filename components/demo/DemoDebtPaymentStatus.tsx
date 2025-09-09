import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatCurrency, calculatePaymentProgressWithPayments } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

interface DemoDebtPaymentStatusProps {
	debt: Debt;
	payments: Payment[];
}

export default function DemoDebtPaymentStatus({ debt, payments }: DemoDebtPaymentStatusProps) {
	const t = useTranslations();
	const tPayment = useTranslations("paymentStatus");
	const tDashboard = useTranslations("dashboard");
	const [showDemoAlert, setShowDemoAlert] = useState(false);

	const { paidPayments, totalPayments } = calculatePaymentProgressWithPayments(debt, payments);
	const nextPaymentNumber = paidPayments + 1;

	const handleMarkAsPaid = () => {
		setShowDemoAlert(true);
		setTimeout(() => setShowDemoAlert(false), 3000);
	};

	if (paidPayments >= totalPayments) {
		return (
			<div className="text-sm text-success font-medium">
				✅ {tPayment("allPaymentsCompleted")}
			</div>
		);
	}

	return (
		<div className="space-y-2">
			{showDemoAlert && (
				<div className="alert alert-info alert-sm">
					<span className="text-xs">
						¡Esta es solo una demo! Regístrate para gestionar pagos reales.
					</span>
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
				className="btn btn-primary btn-sm w-full"
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