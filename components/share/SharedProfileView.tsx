"use client";

import {
	CheckCircleIcon,
	CreditCardIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	calculateDebtStatus,
	calculatePaymentProgress,
	calculateRemainingAmount,
	calculateTotalAmount,
} from "@/lib/format";
import {
	getFormattingLocale,
	resolveSharedCurrency,
} from "@/lib/sharedPresentation";
import type { Debt, SharedProfile } from "@/lib/types";

interface SharedProfileViewProps {
	debts: Debt[];
	share: SharedProfile;
	currency?: string;
	userName?: string;
}

function formatCurrencySimple(
	amount: number,
	locale: string,
	currency: string,
): string {
	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
	}).format(amount);
}

export default function SharedProfileView({
	debts,
	share,
	currency,
	userName,
}: SharedProfileViewProps) {
	const locale = useLocale();
	const t = useTranslations("share.profile");
	const tShare = useTranslations("share");
	const [animatedProgress, setAnimatedProgress] = useState(0);
	const formattingLocale = getFormattingLocale(locale);
	const resolvedCurrency = resolveSharedCurrency(currency);

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
						(sum, debt) => sum + calculatePaymentProgress(debt).percentage,
						0,
					) / activeDebts.length,
				)
			: 0;

	const totalOriginalDebt = activeDebts.reduce(
		(sum, debt) => sum + calculateTotalAmount(debt),
		0,
	);
	const totalPaid = totalOriginalDebt - totalDebt;

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimatedProgress(averageProgress);
		}, 100);
		return () => clearTimeout(timer);
	}, [averageProgress]);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	const summaryParts = [
		t("activeSummary", { count: activeDebts.length }),
		...(share.show_completed && completedDebts.length > 0
			? [t("completedSummary", { count: completedDebts.length })]
			: []),
	];

	return (
		<div className="py-6 space-y-4">
			{/* Header */}
			<div className="text-center mb-6">
				<p className="text-sm text-base-content/50 mb-2">{tShare("brand")}</p>
				<h1 className="text-2xl font-bold">
					{userName ? `${userName}` : t("titleFallback")}
				</h1>
				<p className="text-base-content/70 mt-1">{summaryParts.join(" · ")}</p>
			</div>

			{/* Average progress */}
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body p-4">
					<h2 className="card-title text-lg mb-2">
						<TargetIcon className="w-5 h-5" />
						{t("globalProgress")}
					</h2>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="w-full bg-base-300 rounded-full h-4">
									<div
										className="bg-primary h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
										style={{
											width: `${animatedProgress > 0 ? Math.max(animatedProgress, 5) : 0}%`,
										}}
									>
										{animatedProgress > 15 && (
											<span className="text-sm font-medium text-primary-content">
												{animatedProgress}%
											</span>
										)}
									</div>
								</div>
							</div>
							{animatedProgress <= 15 && (
								<span className="text-lg font-semibold text-primary">
									{animatedProgress}%
								</span>
							)}
						</div>
						<div className="text-sm text-base-content/70 text-center">
							{t("averageProgressDescription")}
						</div>
					</div>
				</div>
			</div>

			{/* Summary stats */}
			{share.show_amounts && (
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							{t("pendingDebt")}
						</div>
						<div className="text-xl font-bold text-warning">
							{formatCurrencySimple(
								totalDebt,
								formattingLocale,
								resolvedCurrency,
							)}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							{t("monthlyPayment")}
						</div>
						<div className="text-xl font-bold text-secondary">
							{formatCurrencySimple(
								totalMonthlyPayment,
								formattingLocale,
								resolvedCurrency,
							)}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							{t("totalPaid")}
						</div>
						<div className="text-xl font-bold text-success">
							{formatCurrencySimple(
								Math.max(0, totalPaid),
								formattingLocale,
								resolvedCurrency,
							)}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							{t("originalDebt")}
						</div>
						<div className="text-xl font-bold text-primary">
							{formatCurrencySimple(
								totalOriginalDebt,
								formattingLocale,
								resolvedCurrency,
							)}
						</div>
					</div>
				</div>
			)}

			{/* Quick stats without amounts */}
			{!share.show_amounts && (
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							{t("active")}
						</div>
						<div className="text-2xl font-bold text-primary">
							{activeDebts.length}
						</div>
					</div>
					{share.show_completed && (
						<div className="bg-base-100 rounded-xl border border-base-300 p-4">
							<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
								{t("completed")}
							</div>
							<div className="text-2xl font-bold text-success">
								{completedDebts.length}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Completed stats */}
			{share.show_completed &&
				share.show_amounts &&
				completedDebts.length > 0 && (
					<div className="card bg-success/10 border-2 border-success/30 shadow-sm">
						<div className="card-body p-4">
							<div className="flex items-center gap-2 mb-2">
								<CheckCircleIcon className="w-5 h-5 text-success" />
								<h2 className="font-bold text-lg text-success">
									{t("completedBannerTitle", {
										count: completedDebts.length,
									})}
								</h2>
							</div>
							<div className="text-sm text-base-content/70">
								{t("totalLiquidated", {
									amount: formatCurrencySimple(
										completedDebts.reduce(
											(sum, debt) => sum + calculateTotalAmount(debt),
											0,
										),
										formattingLocale,
										resolvedCurrency,
									),
								})}
							</div>
						</div>
					</div>
				)}

			{/* Debt list */}
			{share.show_debt_list && activeDebts.length > 0 && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CreditCardIcon className="w-5 h-5" />
							{t("activeFinancing")}
						</h2>
						<div className="space-y-3">
							{activeDebts.map((debt) => {
								const progress = calculatePaymentProgress(debt);
								return (
									<div
										key={debt.id}
										className="bg-base-200 rounded-xl border border-base-300 p-3"
									>
										<div className="flex justify-between items-start mb-2">
											<div>
												<div className="font-medium">{debt.name}</div>
												<div className="text-sm text-base-content/60">
													{debt.entity}
												</div>
											</div>
											{share.show_amounts && (
												<div className="text-right">
													<div className="text-sm font-bold text-warning">
														{formatCurrencySimple(
															calculateRemainingAmount(debt),
															formattingLocale,
															resolvedCurrency,
														)}
													</div>
													<div className="text-xs text-base-content/50">
														{t("pendingShort")}
													</div>
												</div>
											)}
										</div>
										<div className="flex items-center gap-3">
											<div className="flex-1">
												<div className="w-full bg-base-300 rounded-full h-2.5">
													<div
														className="bg-primary h-2.5 rounded-full transition-all duration-500"
														style={{
															width: `${Math.max(progress.percentage, 2)}%`,
														}}
													/>
												</div>
											</div>
											<span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
												{progress.percentage}%
											</span>
										</div>
										{share.show_amounts && (
											<div className="flex justify-between text-xs text-base-content/50 mt-1">
												<span>
													{t("perMonth", {
														amount: formatCurrencySimple(
															debt.monthly_amount,
															formattingLocale,
															resolvedCurrency,
														),
													})}
												</span>
												<span>
													{t("installmentsProgress", {
														paid: progress.paidPayments,
														total: progress.totalPayments,
													})}
												</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Completed debt list */}
			{share.show_debt_list &&
				share.show_completed &&
				completedDebts.length > 0 && (
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body p-4">
							<h2 className="card-title text-lg mb-3">
								<CheckCircleIcon className="w-5 h-5 text-success" />
								{t("completedFinancing")}
							</h2>
							<div className="space-y-3">
								{completedDebts.map((debt) => (
									<div
										key={debt.id}
										className="bg-success/5 rounded-xl border border-success/20 p-3"
									>
										<div className="flex justify-between items-center">
											<div>
												<div className="font-medium">{debt.name}</div>
												<div className="text-sm text-base-content/60">
													{debt.entity}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{share.show_amounts && (
													<span className="text-sm font-bold text-success">
														{formatCurrencySimple(
															calculateTotalAmount(debt),
															formattingLocale,
															resolvedCurrency,
														)}
													</span>
												)}
												<CheckCircleIcon className="w-5 h-5 text-success" />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

			{/* Footer branding */}
			<div className="text-center pt-4">
				<p className="text-xs text-base-content/40">
					{tShare("sharedWithBrand")}
				</p>
			</div>
		</div>
	);
}
