"use client";

import { useTranslations } from "next-intl";
import type { DebtStatsProps } from "@/data/debtDetail";

export default function DebtQuickStats({
	debt,
	formatCurrency,
	paymentStats,
	totalAmount,
}: DebtStatsProps) {
	const t = useTranslations();

	const stats = [
		{
			key: "total",
			value: formatCurrency(totalAmount),
			color: "text-primary",
		},
		{
			key: "paid",
			value: formatCurrency(paymentStats.effectivePaidAmount),
			color: "text-success",
		},
		{
			key: "payments",
			value: `${paymentStats.effectivePaidPayments}/${debt.number_of_payments}`,
			color: "text-info",
		},
		{
			key: "monthly",
			value: formatCurrency(debt.monthly_amount),
			color: "text-secondary",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			{stats.map(({ key, value, color }) => (
				<div
					key={key}
					className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200"
				>
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t(`debtDetail.summary.${key}`)}
					</div>
					<div className={`text-xl font-bold ${color}`}>{value}</div>
				</div>
			))}
		</div>
	);
}
