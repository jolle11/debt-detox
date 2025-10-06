import { useFormatter, useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";
import {
	calculatePaidAmountWithPayments,
	calculateRemainingAmountWithPayments,
	calculateTotalAmount,
} from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";

interface DebtInfoProps {
	debt: Debt;
	payments?: Payment[];
}

export default function DebtInfo({ debt, payments = [] }: DebtInfoProps) {
	const t = useTranslations();
	const format = useFormatter();
	const { formatCurrency } = useCurrency();

	const totalAmount = calculateTotalAmount(debt);
	const paidAmount = calculatePaidAmountWithPayments(debt, payments);
	const remainingAmount = calculateRemainingAmountWithPayments(debt, payments);

	const infoItems = [
		{
			label: t("dashboard.debt.totalAmount"),
			value: formatCurrency(totalAmount),
			className: "text-lg font-bold text-base-content",
		},
		{
			label: t("dashboard.debt.paidAmount"),
			value: formatCurrency(paidAmount),
			className: "text-lg font-bold text-success",
		},
		{
			label: t("dashboard.debt.remainingAmount"),
			value: formatCurrency(remainingAmount),
			className: "text-lg font-bold text-primary",
		},
		{
			label: t("dashboard.debt.monthlyAmount"),
			value: formatCurrency(debt.monthly_amount),
			className: "text-lg font-bold text-secondary",
		},
		...(debt.down_payment && debt.down_payment > 0
			? [
					{
						label: t("debt.create.downPayment"),
						value: formatCurrency(debt.down_payment),
						className: "text-lg font-bold text-info",
					},
				]
			: []),
		...(debt.final_payment && debt.final_payment > 0
			? [
					{
						label: t("dashboard.debt.finalPayment"),
						value: formatCurrency(debt.final_payment),
						className: "text-lg font-bold text-accent",
					},
				]
			: []),
		{
			label: t("dashboard.debt.finalPaymentDate"),
			value: debt.final_payment_date
				? format.dateTime(new Date(debt.final_payment_date), {
						year: "numeric",
						month: "2-digit",
						day: "2-digit",
					})
				: "No especificada",
			className: "text-base font-medium text-base-content/70",
		},
	];

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
			{infoItems.map((item, index) => (
				<div key={index}>
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{item.label}
					</div>
					<div className={item.className}>{item.value}</div>
				</div>
			))}
		</div>
	);
}
