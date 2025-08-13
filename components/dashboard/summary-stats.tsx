import { useTranslations } from "next-intl";
import StatCard from "@/components/dashboard/stat-card";
import { MoneyIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from "@phosphor-icons/react";
import type { Debt } from "@/lib/mock-data";

interface SummaryStatsProps {
	debts: Debt[];
}

export default function SummaryStats({ debts }: SummaryStatsProps) {
	const t = useTranslations();

	const activeDebts = debts.filter((d) => d.status === "active");
	const completedDebts = debts.filter((d) => d.status === "completed");

	const totalDebt = activeDebts.reduce(
		(sum, debt) => sum + debt.currentAmount,
		0,
	);
	const totalMonthlyPayment = activeDebts.reduce(
		(sum, debt) => sum + debt.monthlyPayment,
		0,
	);
	const averageProgress =
		activeDebts.length > 0
			? Math.round(
					activeDebts.reduce((sum, debt) => sum + debt.progress, 0) /
						activeDebts.length,
				)
			: 0;

	const stats = [
		{
			title: t("dashboard.stats.totalDebt"),
			value: `${t("common.currency")}${totalDebt.toLocaleString()}`,
			description: t("dashboard.stats.activeDebts", {
				count: activeDebts.length,
			}),
			icon: <MoneyIcon size={32} />,
			variant: "primary" as const,
		},
		{
			title: t("dashboard.stats.monthlyPayment"),
			value: `${t("common.currency")}${totalMonthlyPayment}`,
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