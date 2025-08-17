import {
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	MoneyIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import StatCard from "@/components/dashboard/stat-card";
import {
	calculateDebtStatus,
	calculatePaymentProgress,
	calculateRemainingAmount,
	formatCurrency,
} from "@/lib/format";
import type { Debt } from "@/lib/types";

interface SummaryStatsProps {
	debts: Debt[];
}

export default function SummaryStats({ debts }: SummaryStatsProps) {
	const t = useTranslations();

	const activeDebts = debts.filter(
		(d) => calculateDebtStatus(d.final_payment_date) === "active",
	);
	const completedDebts = debts.filter(
		(d) => calculateDebtStatus(d.final_payment_date) === "completed",
	);

	const totalDebt = activeDebts.reduce(
		(sum, debt) => sum + calculateRemainingAmount(debt),
		0,
	);
	const totalMonthlyPayment = activeDebts.reduce(
		(sum, debt) => sum + debt.monthly_amount,
		0,
	);
	const averageProgress =
		activeDebts.length > 0
			? Math.round(
					activeDebts.reduce(
						(sum, debt) =>
							sum + calculatePaymentProgress(debt).percentage,
						0,
					) / activeDebts.length,
				)
			: 0;

	const stats = [
		{
			title: t("dashboard.stats.totalDebt"),
			value: formatCurrency(totalDebt, t("common.currency")),
			description: t("dashboard.stats.activeDebts", {
				count: activeDebts.length,
			}),
			icon: <MoneyIcon size={32} />,
			variant: "primary" as const,
		},
		{
			title: t("dashboard.stats.monthlyPayment"),
			value: formatCurrency(totalMonthlyPayment, t("common.currency")),
			description: t("dashboard.stats.monthlyTotal"),
			icon: <ClockIcon size={32} />,
			variant: "secondary" as const,
		},
		{
			title: t("dashboard.stats.completed"),
			value: completedDebts.length,
			description: t("dashboard.stats.paidOff"),
			icon: <CheckCircleIcon size={32} />,
			variant: "accent" as const,
		},
		{
			title: t("dashboard.stats.averageProgress"),
			value: `${averageProgress}%`,
			description: t("dashboard.stats.ofAllDebts"),
			icon: <ChartBarIcon size={32} />,
			variant: "info" as const,
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{stats.map((stat, index) => (
				<StatCard
					key={index}
					title={stat.title}
					value={stat.value}
					description={stat.description}
					icon={stat.icon}
					variant={stat.variant}
				/>
			))}
		</div>
	);
}
