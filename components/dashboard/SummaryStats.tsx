import {
	CalendarCheckIcon,
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	ListChecksIcon,
	MoneyIcon,
	PiggyBankIcon,
	TrendUpIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import StatCard from "@/components/dashboard/StatCard";
import { useCurrency } from "@/hooks/useCurrency";
import {
	calculateDashboardMetrics,
	type DashboardWidgetId,
} from "@/lib/dashboardWidgets";
import { parseDateOnly } from "@/lib/dateOnly";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import type { Debt, Payment } from "@/lib/types";

interface SummaryStatsProps {
	debts: Debt[];
	payments?: Payment[];
	widgets?: DashboardWidgetId[];
}

const iconClassName = "w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7";

export default function SummaryStats({
	debts,
	payments = [],
	widgets = [
		"remainingDebt",
		"monthlyPayment",
		"completedDebts",
		"averageProgress",
	],
}: SummaryStatsProps) {
	const t = useTranslations("dashboard.widgets");
	const locale = useLocale();
	const { formatCurrency } = useCurrency();
	const metrics = calculateDashboardMetrics(debts, payments);
	const nextDate = metrics.nextCompletion
		? parseDateOnly(resolveFinalPaymentDate(metrics.nextCompletion))
		: null;
	const cards: Record<
		DashboardWidgetId,
		{
			title: string;
			value: string | number;
			description: string;
			icon: React.ReactNode;
			variant: "primary" | "secondary" | "accent" | "info";
		}
	> = {
		remainingDebt: {
			title: t("remainingDebt.title"),
			value: formatCurrency(metrics.remainingDebt),
			description: t("remainingDebt.description", {
				count: metrics.activeDebts,
			}),
			icon: <MoneyIcon className={iconClassName} />,
			variant: "primary",
		},
		monthlyPayment: {
			title: t("monthlyPayment.title"),
			value: formatCurrency(metrics.monthlyPayment),
			description: t("monthlyPayment.description"),
			icon: <ClockIcon className={iconClassName} />,
			variant: "secondary",
		},
		completedDebts: {
			title: t("completedDebts.title"),
			value: metrics.completedDebts,
			description: t("completedDebts.description"),
			icon: <CheckCircleIcon className={iconClassName} />,
			variant: "accent",
		},
		averageProgress: {
			title: t("averageProgress.title"),
			value: `${metrics.averageProgress}%`,
			description: t("averageProgress.description"),
			icon: <ChartBarIcon className={iconClassName} />,
			variant: "info",
		},
		originalDebt: {
			title: t("originalDebt.title"),
			value: formatCurrency(metrics.originalDebt),
			description: t("originalDebt.description"),
			icon: <WalletIcon className={iconClassName} />,
			variant: "secondary",
		},
		totalPaid: {
			title: t("totalPaid.title"),
			value: formatCurrency(metrics.totalPaid),
			description: t("totalPaid.description"),
			icon: <PiggyBankIcon className={iconClassName} />,
			variant: "accent",
		},
		activeDebts: {
			title: t("activeDebts.title"),
			value: metrics.activeDebts,
			description: t("activeDebts.description"),
			icon: <ListChecksIcon className={iconClassName} />,
			variant: "primary",
		},
		paidThisMonth: {
			title: t("paidThisMonth.title"),
			value: formatCurrency(metrics.paidThisMonth),
			description: t("paidThisMonth.description"),
			icon: <CalendarCheckIcon className={iconClassName} />,
			variant: "info",
		},
		extraPayments: {
			title: t("extraPayments.title"),
			value: formatCurrency(metrics.extraPayments),
			description: t("extraPayments.description"),
			icon: <TrendUpIcon className={iconClassName} />,
			variant: "accent",
		},
		nextCompletion: {
			title: t("nextCompletion.title"),
			value: metrics.nextCompletion?.name ?? t("nextCompletion.empty"),
			description: nextDate
				? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
						nextDate,
					)
				: t("nextCompletion.description"),
			icon: <CalendarCheckIcon className={iconClassName} />,
			variant: "secondary",
		},
	};

	if (widgets.length === 0) return null;

	return (
		<div className="grid grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
			{widgets.map((widgetId) => (
				<StatCard
					key={widgetId}
					{...cards[widgetId]}
					monetary={[
						"remainingDebt",
						"monthlyPayment",
						"originalDebt",
						"totalPaid",
						"paidThisMonth",
						"extraPayments",
					].includes(widgetId)}
				/>
			))}
		</div>
	);
}
