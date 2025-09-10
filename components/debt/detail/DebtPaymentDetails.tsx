"use client";

import { CreditCardIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { DebtPaymentDetailsProps } from "@/data/debtDetail";

export default function DebtPaymentDetails({
	debt,
	formatCurrency,
	paymentStats,
}: DebtPaymentDetailsProps) {
	const t = useTranslations();

	const paymentData = [
		{
			key: "paidPayments",
			value: paymentStats.effectivePaidPayments,
			subtitle: `${t("debtDetail.paymentDetails.of")} ${debt.number_of_payments}`,
			color: "text-success",
		},
		{
			key: "pending",
			value: paymentStats.pendingPayments,
			subtitle: t("debtDetail.paymentDetails.remaining"),
			color: "text-warning",
		},
		{
			key: "paidAmount",
			value: formatCurrency(paymentStats.effectivePaidAmount),
			subtitle: null,
			color: "text-success",
			textSize: "text-lg",
		},
		{
			key: "toPay",
			value: formatCurrency(Math.max(0, paymentStats.pendingAmount)),
			subtitle: null,
			color: "text-warning",
			textSize: "text-lg",
		},
	];

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5">
				<h2 className="card-title text-xl mb-4">
					<CreditCardIcon className="w-6 h-6" />
					{t("debtDetail.sections.paymentDetails")}
				</h2>
				<div className="grid grid-cols-2 gap-4">
					{paymentData.map(
						({
							key,
							value,
							subtitle,
							color,
							textSize = "text-2xl",
						}) => (
							<div
								key={key}
								className="bg-base-200 rounded-xl border border-base-300 p-4"
							>
								<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
									{t(`debtDetail.paymentDetails.${key}`)}
								</div>
								<div
									className={`${textSize} font-bold ${color}`}
								>
									{value}
								</div>
								{subtitle && (
									<div className="text-base text-base-content/70 mt-1">
										{subtitle}
									</div>
								)}
							</div>
						),
					)}
				</div>
			</div>
		</div>
	);
}
