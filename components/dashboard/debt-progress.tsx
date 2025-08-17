import { useTranslations } from "next-intl";
import { calculateDebtStatus, calculatePaymentProgress } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtProgressProps {
	debt: Debt;
}

export default function DebtProgress({ debt }: DebtProgressProps) {
	const t = useTranslations();
	const { percentage, paidPayments, totalPayments } =
		calculatePaymentProgress(debt);
	const status = calculateDebtStatus(debt.final_payment_date);

	return (
		<div className="mt-4 space-y-2">
			<div className="flex justify-between text-sm mb-1">
				<span>{t("dashboard.debt.progress")}</span>
				<span>{percentage}%</span>
			</div>
			<progress
				className={`progress ${
					status === "completed"
						? "progress-success"
						: "progress-primary"
				} w-full`}
				value={percentage}
				max="100"
			/>
			<div className="flex justify-between text-xs text-base-content/70">
				<span>{t("dashboard.debt.paymentsProgress")}</span>
				<span>
					{paidPayments} / {totalPayments}
				</span>
			</div>
		</div>
	);
}
