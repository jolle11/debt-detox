"use client";

import {
	CalendarCheckIcon,
	CoinsIcon,
	PercentIcon,
	TrendDownIcon,
	WalletIcon,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import StatCard from "@/components/dashboard/StatCard";
import DebtBreakdown from "@/components/metrics/DebtBreakdown";
import DebtEvolutionChart from "@/components/metrics/DebtEvolutionChart";
import UpcomingLoadChart from "@/components/metrics/UpcomingLoadChart";
import SkeletonDebtsList from "@/components/ui/skeletons/SkeletonDebtsList";
import SkeletonSummaryStats from "@/components/ui/skeletons/SkeletonSummaryStats";
import { useAuth } from "@/contexts/AuthContext";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { useCurrency } from "@/hooks/useCurrency";
import { usePayments } from "@/hooks/usePayments";
import { Link } from "@/i18n/routing";
import { calculateFinancingSummary } from "@/lib/financing";
import { calculateMetricsSummary } from "@/lib/metrics";

export default function MetricsDashboard() {
	const t = useTranslations("metrics");
	const locale = useLocale();
	const { formatCurrency } = useCurrency();
	const { user } = useAuth();
	const { debts, isLoading, error } = useDebtsContext();
	const { payments, isLoading: paymentsLoading } = usePayments();
	const summary = useMemo(
		() => calculateMetricsSummary(debts, payments),
		[debts, payments],
	);

	const financing = useMemo(() => calculateFinancingSummary(debts), [debts]);

	if (isLoading || paymentsLoading) {
		return (
			<div className="space-y-4">
				<SkeletonSummaryStats />
				<SkeletonDebtsList />
			</div>
		);
	}

	if (error) {
		return (
			<div className="alert alert-error">
				<span>{error}</span>
			</div>
		);
	}

	const heading = (
		<div>
			<h1 className="text-2xl font-bold">{t("title")}</h1>
			<p className="text-sm text-base-content/60">{t("subtitle")}</p>
		</div>
	);

	if (debts.length === 0) {
		return (
			<div className="space-y-4">
				{heading}
				<div className="card bg-base-100 border border-base-300">
					<div className="card-body items-center text-center">
						<p className="text-base-content/70">{t("empty")}</p>
						<Link href="/dashboard" className="btn btn-primary btn-sm">
							{t("backToDashboard")}
						</Link>
					</div>
				</div>
			</div>
		);
	}

	const signed = (value: number) =>
		`${value > 0 ? "+" : ""}${formatCurrency(value)}`;
	const hideAmounts = user?.hide_amounts === true;
	const monthChange =
		summary.changeFromLastMonth === null
			? t("kpi.noHistory")
			: t("kpi.changeFromLastMonth", {
					amount: hideAmounts ? "••••" : signed(summary.changeFromLastMonth),
				});
	const debtFreeDate = summary.debtFreePeriod
		? new Date(`${summary.debtFreePeriod}-01T00:00:00`).toLocaleDateString(
				locale,
				{ month: "short", year: "numeric" },
			)
		: t("kpi.debtFreeNow");

	return (
		<div className="space-y-4">
			{heading}

			<div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
				<StatCard
					title={t("kpi.debtFree")}
					value={debtFreeDate}
					description={
						summary.monthsLeft === null
							? t("kpi.debtFreeDone")
							: t("kpi.monthsLeft", { count: summary.monthsLeft })
					}
					icon={<CalendarCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="primary"
				/>
				<StatCard
					title={t("kpi.remaining")}
					monetary
					value={formatCurrency(summary.remaining)}
					description={monthChange}
					icon={<WalletIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="secondary"
				/>
				<StatCard
					title={t("kpi.yearChange")}
					monetary={summary.changeFromLastYear !== null}
					value={
						summary.changeFromLastYear === null
							? "—"
							: signed(summary.changeFromLastYear)
					}
					description={
						summary.changeFromLastYear === null
							? t("kpi.noHistory")
							: t("kpi.yearChangeHint")
					}
					icon={<TrendDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="accent"
				/>
				<StatCard
					title={t("kpi.paidPercent")}
					value={`${summary.paidPercent}%`}
					description={t("kpi.paidPercentHint")}
					icon={<PercentIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="info"
				/>
			</div>

			<div className="grid grid-cols-2 gap-2 sm:gap-4">
				<StatCard
					title={t("financing.cost")}
					monetary={financing.included > 0}
					value={
						financing.included > 0 ? formatCurrency(financing.totalCost) : "—"
					}
					description={
						financing.missing > 0
							? t("financing.missing", { count: financing.missing })
							: t("financing.costHint")
					}
					icon={<CoinsIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="secondary"
				/>
				<StatCard
					title={t("financing.tae")}
					value={
						financing.averageTae === null
							? "—"
							: `${new Intl.NumberFormat(locale, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								}).format(financing.averageTae)} %`
					}
					description={t("financing.taeHint")}
					icon={<PercentIcon className="w-4 h-4 sm:w-5 sm:h-5" />}
					variant="info"
				/>
			</div>

			<DebtEvolutionChart debts={debts} payments={payments} />

			<div className="grid gap-4 lg:grid-cols-2">
				<UpcomingLoadChart debts={debts} payments={payments} />
				<DebtBreakdown debts={debts} payments={payments} />
			</div>
		</div>
	);
}
