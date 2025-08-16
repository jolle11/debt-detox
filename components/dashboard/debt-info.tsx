import { useFormatter, useTranslations } from "next-intl";
import {
	calculateCurrentAmount,
	calculateMonthlyPayment,
	formatCurrency,
} from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtInfoProps {
	debt: Debt;
}

export default function DebtInfo({ debt }: DebtInfoProps) {
	const t = useTranslations();
	const format = useFormatter();

	const currentAmount = calculateCurrentAmount(
		debt.final_amount,
		debt.start_date,
		debt.end_date,
	);
	const monthlyPayment = calculateMonthlyPayment(
		debt.final_amount,
		debt.start_date,
		debt.end_date,
	);

	const infoItems = [
		{
			label: t("dashboard.debt.currentAmount"),
			value: formatCurrency(currentAmount, t("common.currency")),
			className: "text-lg font-bold text-primary",
		},
		{
			label: t("dashboard.debt.initialAmount"),
			value: formatCurrency(
				debt.initial_amount || debt.final_amount,
				t("common.currency"),
			),
			className: "text-base-content/70",
		},
		{
			label: t("dashboard.debt.monthlyPayment"),
			value: formatCurrency(monthlyPayment, t("common.currency")),
			className: "text-secondary",
		},
		{
			label: t("dashboard.debt.endDate"),
			value: format.dateTime(new Date(debt.end_date), {
				year: "numeric",
				month: "2-digit",
				day: "2-digit",
			}),
			className: "text-base-content/70",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
			{infoItems.map((item, index) => (
				<div key={index}>
					<span className="font-semibold">{item.label}:</span>
					<div className={item.className}>{item.value}</div>
				</div>
			))}
		</div>
	);
}
