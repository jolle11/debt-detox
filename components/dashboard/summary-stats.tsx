import {
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	MoneyIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import StatCard from "@/components/dashboard/stat-card";
import {
	calculateCurrentAmount,
	calculateDebtStatus,
	calculateMonthlyPayment,
	calculateProgress,
	formatCurrency,
} from "@/lib/format";
import type { Debt } from "@/lib/types";

interface SummaryStatsProps {
	debts: Debt[];
}

export default function SummaryStats({ debts }: SummaryStatsProps) {
	const t = useTranslations();

	const activeDebts = debts.filter(
		(d) => calculateDebtStatus(d.end_date) === "active",
	);
	const completedDebts = debts.filter(
		(d) => calculateDebtStatus(d.end_date) === "completed",
	);

	const totalDebt = activeDebts.reduce(
		(sum, debt) =>
			sum +
			calculateCurrentAmount(
				debt.final_amount,
				debt.start_date,
				debt.end_date,
			),
		0,
	);
	const totalMonthlyPayment = activeDebts.reduce(
		(sum, debt) =>
			sum +
			calculateMonthlyPayment(
				debt.final_amount,
				debt.start_date,
				debt.end_date,
			),
		0,
	);
	const averageProgress =
		activeDebts.length > 0
			? Math.round(
					activeDebts.reduce(
						(sum, debt) =>
							sum +
							calculateProgress(debt.start_date, debt.end_date),
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
