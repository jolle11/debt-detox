import { useFormatter, useTranslations } from "next-intl";
import { formatCurrency } from "@/lib/format";
import type { Debt } from "@/lib/mock-data";

interface DebtInfoProps {
	debt: Debt;
}

export default function DebtInfo({ debt }: DebtInfoProps) {
	const t = useTranslations();
	const format = useFormatter();

	const infoItems = [
		{
			label: t("dashboard.debt.currentAmount"),
			value: formatCurrency(debt.currentAmount, t("common.currency")),
			className: "text-lg font-bold text-primary",
		},
		{
			label: t("dashboard.debt.initialAmount"),
			value: formatCurrency(debt.initialAmount, t("common.currency")),
			className: "text-base-content/70",
		},
		{
			label: t("dashboard.debt.monthlyPayment"),
			value: formatCurrency(debt.monthlyPayment, t("common.currency")),
			className: "text-secondary",
		},
		{
			label: t("dashboard.debt.endDate"),
			value: format.dateTime(new Date(debt.endDate), {
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
