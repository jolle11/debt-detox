"use client";

import { useTranslations } from "next-intl";
import { TargetIcon } from "@phosphor-icons/react";
import DebtProgressWithPayments from "@/components/dashboard/debt-progress-with-payments";
import DebtPaymentStatus from "@/components/dashboard/debt-payment-status";
import type { DebtDetailProps } from "@/data/debtDetail";

export default function DebtProgressSection({
	debt,
	payments,
	isLoading,
}: DebtDetailProps) {
	const t = useTranslations();

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<h2 className="card-title text-lg mb-2">
					<TargetIcon className="w-5 h-5" />
					{t("debtDetail.sections.progress")}
				</h2>
				<DebtProgressWithPayments
					debt={debt}
					payments={payments}
					isLoading={isLoading || false}
				/>
				<div className="mt-3">
					<DebtPaymentStatus
						debt={debt}
						payments={payments}
					/>
				</div>
			</div>
		</div>
	);
}