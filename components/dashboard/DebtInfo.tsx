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

	const primaryItems = [
		{
			label: t("dashboard.debt.totalAmount"),
			value: formatCurrency(totalAmount),
			className: "text-sm sm:text-lg font-bold text-base-content",
		},
		{
			label: t("dashboard.debt.paidAmount"),
			value: formatCurrency(paidAmount),
			className: "text-sm sm:text-lg font-bold text-success",
		},
		{
			label: t("dashboard.debt.remainingAmount"),
			value: formatCurrency(remainingAmount),
			className: "text-sm sm:text-lg font-bold text-primary",
		},
		{
			label: t("dashboard.debt.monthlyAmount"),
			value: formatCurrency(debt.monthly_amount),
			className: "text-sm sm:text-lg font-bold text-secondary",
		},
	];

	const secondaryItems = [
		...(debt.down_payment && debt.down_payment > 0
			? [
					{
						label: t("debt.create.downPayment"),
						value: formatCurrency(debt.down_payment),
						className: "text-sm sm:text-lg font-bold text-info",
					},
				]
			: []),
		...(debt.final_payment && debt.final_payment > 0
			? [
					{
						label: t("dashboard.debt.finalPayment"),
						value: formatCurrency(debt.final_payment),
						className: "text-sm sm:text-lg font-bold text-accent",
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
			className: "text-xs sm:text-base font-medium text-base-content/70",
		},
	];

	return (
		<div className="space-y-2 sm:space-y-3">
			{/* Primary financial stats — always 4 columns on desktop */}
			<div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 sm:gap-4">
				{primaryItems.map((item, index) => (
					<div key={index} className="min-w-0">
						<div className="text-xs sm:text-sm font-medium text-base-content/60 uppercase tracking-wide mb-0.5 sm:mb-1">
							{item.label}
						</div>
						<div className={item.className}>{item.value}</div>
					</div>
				))}
			</div>

			{/* Secondary details — flexible grid that fills the row */}
			{secondaryItems.length > 0 && (
				<div className={`grid gap-x-3 gap-y-2 sm:gap-4 ${
					secondaryItems.length === 1
						? "grid-cols-1"
						: secondaryItems.length === 2
							? "grid-cols-2"
							: "grid-cols-2 lg:grid-cols-3"
				}`}>
					{secondaryItems.map((item, index) => (
						<div key={index} className="min-w-0">
							<div className="text-xs sm:text-sm font-medium text-base-content/60 uppercase tracking-wide mb-0.5 sm:mb-1">
								{item.label}
							</div>
							<div className={item.className}>{item.value}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
