import { useFormatter, useTranslations } from "next-intl";
import {
	calculatePaidAmount,
	calculateRemainingAmount,
	calculateTotalAmount,
	formatCurrency,
} from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtInfoProps {
	debt: Debt;
}

export default function DebtInfo({ debt }: DebtInfoProps) {
	const t = useTranslations();
	const format = useFormatter();

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmount(debt);
	const remainingAmount = calculateRemainingAmount(debt);

	const infoItems = [
		{
			label: t("dashboard.debt.totalAmount"),
			value: formatCurrency(totalAmount, t("common.currency")),
			className: "text-base-content/70",
		},
		{
			label: t("dashboard.debt.paidAmount"),
			value: formatCurrency(paidAmount, t("common.currency")),
			className: "text-success",
		},
		{
			label: t("dashboard.debt.remainingAmount"),
			value: formatCurrency(remainingAmount, t("common.currency")),
			className: "text-lg font-bold text-primary",
		},
		{
			label: t("dashboard.debt.monthlyAmount"),
			value: formatCurrency(debt.monthly_amount, t("common.currency")),
			className: "text-secondary",
		},
		{
			label: t("dashboard.debt.finalPayment"),
			value: formatCurrency(
				debt.final_payment || 0,
				t("common.currency"),
			),
			className: "text-accent",
		},
		{
			label: t("dashboard.debt.finalPaymentDate"),
			value: format.dateTime(new Date(debt.final_payment_date), {
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
