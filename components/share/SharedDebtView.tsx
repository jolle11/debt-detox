"use client";

import {
	Calendar,
	CalendarIcon,
	CheckCircle,
	CreditCardIcon,
	FileTextIcon,
	TargetIcon,
	XCircle,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	calculatePaymentProgressWithPayments,
	calculateTotalAmount,
} from "@/lib/format";
import {
	getFormattingLocale,
	resolveSharedCurrency,
} from "@/lib/sharedPresentation";
import type { Debt, Payment, SharedDebt } from "@/lib/types";
import { calculatePaymentStats } from "@/utils/debtCalculations";

interface SharedDebtViewProps {
	debt: Debt;
	payments: Payment[];
	share: SharedDebt;
	currency?: string;
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

function formatDate(dateString: string, locale: string): string {
	return new Date(dateString).toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatMonthYear(month: number, year: number, locale: string): string {
	const date = new Date(year, month - 1, 1);
	return date.toLocaleDateString(locale, {
		month: "long",
		year: "numeric",
	});
}

function formatShortDate(dateString: string, locale: string): string {
	return new Date(dateString).toLocaleDateString(locale, {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function generateExpectedPayments(debt: Debt, payments: Payment[]) {
	const expectedPayments: Array<{
		month: number;
		year: number;
		planned_amount: number;
		payment: Payment | null;
		extraPayments: Payment[];
		isOverdue: boolean;
		totalActualAmount: number;
	}> = [];

	const startDate = new Date(debt.first_payment_date);
	const now = new Date();

	for (let i = 0; i < debt.number_of_payments; i++) {
		const paymentDate = new Date(startDate);
		paymentDate.setMonth(paymentDate.getMonth() + i);

		const month = paymentDate.getMonth() + 1;
		const year = paymentDate.getFullYear();

		const dueDate = new Date(paymentDate);
		dueDate.setDate(startDate.getDate());
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const dueDateOnly = new Date(
			dueDate.getFullYear(),
			dueDate.getMonth(),
			dueDate.getDate(),
		);
		const isOverdue = dueDateOnly < today;

		const actualPayment =
			payments.find(
				(p) =>
					p.month === month &&
					p.year === year &&
					p.debt_id === debt.id &&
					!p.is_extra_payment,
			) || null;

		const extraPaymentsForMonth = payments.filter(
			(p) =>
				p.month === month &&
				p.year === year &&
				p.debt_id === debt.id &&
				p.is_extra_payment &&
				p.paid,
		);

		const actualAmount = actualPayment?.paid
			? actualPayment.actual_amount || debt.monthly_amount
			: 0;

		expectedPayments.push({
			month,
			year,
			planned_amount: actualPayment
				? actualPayment.planned_amount || debt.monthly_amount
				: debt.monthly_amount,
			payment: actualPayment,
			extraPayments: extraPaymentsForMonth,
			isOverdue: isOverdue && (!actualPayment || !actualPayment.paid),
			totalActualAmount: actualAmount,
		});
	}

	return expectedPayments;
}

export default function SharedDebtView({
	debt,
	payments,
	share,
	currency,
}: SharedDebtViewProps) {
	const locale = useLocale();
	const t = useTranslations("share.debt");
	const tShare = useTranslations("share");
	const tCommon = useTranslations("share.common");
	const [animatedPercentage, setAnimatedPercentage] = useState(0);
	const formattingLocale = getFormattingLocale(locale);
	const resolvedCurrency = resolveSharedCurrency(currency);

	const totalAmount = calculateTotalAmount(debt);
	const paymentStats = calculatePaymentStats(debt, payments);
	const progress = calculatePaymentProgressWithPayments(debt, payments);

	const validPercentage = Math.min(
		Number.isNaN(progress.percentage) ? 0 : progress.percentage,
		100,
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimatedPercentage(validPercentage);
		}, 100);
		return () => clearTimeout(timer);
	}, [validPercentage]);

	useEffect(() => {
		document.documentElement.lang = locale;
	}, [locale]);

	return (
		<div className="py-6 space-y-4">
			{/* Header */}
			<div className="text-center mb-6">
				<p className="text-sm text-base-content/50 mb-2">{tShare("brand")}</p>
				<h1 className="text-2xl font-bold">{debt.name}</h1>
				{share.show_entity && (
					<p className="text-base-content/70 mt-1">{debt.entity}</p>
				)}
			</div>

			{/* Remaining amount highlight */}
			{share.show_amounts && (
				<div className="card bg-warning/10 border-2 border-warning/30 shadow-sm">
					<div className="card-body p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm font-medium text-warning uppercase tracking-wide mb-1">
									{t("remainingToPay")}
								</div>
								<div className="text-3xl font-bold text-warning">
									{formatCurrencySimple(
										Math.max(0, paymentStats.pendingAmount),
										formattingLocale,
										resolvedCurrency,
									)}
								</div>
								<div className="text-sm text-base-content/60 mt-1">
									{t("remainingInstallments", {
										count: paymentStats.pendingPayments,
									})}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm text-base-content/60 mb-1">
									{t("outOfTotal")}
								</div>
								<div className="text-lg font-semibold text-base-content/80">
									{formatCurrencySimple(
										totalAmount,
										formattingLocale,
										resolvedCurrency,
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Progress */}
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body p-4">
					<h2 className="card-title text-lg mb-2">
						<TargetIcon className="w-5 h-5" />
						{t("progress")}
					</h2>

					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="w-full bg-base-300 rounded-full h-4">
									<div
										className="bg-primary h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
										style={{
											width: `${animatedPercentage > 0 ? Math.max(animatedPercentage, 5) : 0}%`,
										}}
									>
										{animatedPercentage > 15 && (
											<span className="text-sm font-medium text-primary-content">
												{Math.round(animatedPercentage)}%
											</span>
										)}
									</div>
								</div>
							</div>
							{animatedPercentage <= 15 && (
								<span className="text-lg font-semibold text-primary">
									{Math.round(animatedPercentage)}%
								</span>
							)}
						</div>

						<div className="flex justify-between items-center">
							<span className="text-lg font-medium">
								{t("installmentsProgress", {
									paid: progress.paidPayments,
									total: progress.totalPayments,
								})}
							</span>
							<span className="text-base text-base-content/70">
								{t("remainingCount", {
									count: progress.totalPayments - progress.paidPayments,
								})}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Quick stats (conditional on amounts) */}
			{share.show_amounts && (
				<div className="grid grid-cols-3 gap-3">
					{[
						{
							label: t("paid"),
							value: formatCurrencySimple(
								paymentStats.effectivePaidAmount,
								formattingLocale,
								resolvedCurrency,
							),
							color: "text-success",
						},
						{
							label: t("installments"),
							value: `${paymentStats.effectivePaidPayments}/${debt.number_of_payments}`,
							color: "text-info",
						},
						{
							label: t("monthly"),
							value: formatCurrencySimple(
								debt.monthly_amount,
								formattingLocale,
								resolvedCurrency,
							),
							color: "text-secondary",
						},
					].map(({ label, value, color }) => (
						<div
							key={label}
							className="bg-base-100 rounded-xl border border-base-300 p-4"
						>
							<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
								{label}
							</div>
							<div className={`text-xl font-bold ${color}`}>{value}</div>
						</div>
					))}
				</div>
			)}

			{/* Payment details (conditional on amounts) */}
			{share.show_amounts && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CreditCardIcon className="w-5 h-5" />
							{t("paymentDetails")}
						</h2>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									{t("installmentsPaid")}
								</div>
								<div className="text-2xl font-bold text-success">
									{paymentStats.effectivePaidPayments}
								</div>
								<div className="text-sm text-base-content/70">
									{t("ofInstallments", { count: debt.number_of_payments })}
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									{t("pending")}
								</div>
								<div className="text-2xl font-bold text-warning">
									{paymentStats.pendingPayments}
								</div>
								<div className="text-sm text-base-content/70">
									{t("remainingWord")}
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									{t("amountPaid")}
								</div>
								<div className="text-lg font-bold text-success">
									{formatCurrencySimple(
										paymentStats.effectivePaidAmount,
										formattingLocale,
										resolvedCurrency,
									)}
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									{t("amountToPay")}
								</div>
								<div className="text-lg font-bold text-warning">
									{formatCurrencySimple(
										Math.max(0, paymentStats.pendingAmount),
										formattingLocale,
										resolvedCurrency,
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Structure (conditional on amounts) */}
			{share.show_amounts && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<FileTextIcon className="w-5 h-5" />
							{t("structure")}
						</h2>
						<div className="space-y-3">
							{debt.down_payment != null && debt.down_payment > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-base-content/70">
										{t("downPayment")}:
									</span>
									<span className="font-medium">
										{formatCurrencySimple(
											debt.down_payment,
											formattingLocale,
											resolvedCurrency,
										)}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center">
								<span className="text-base-content/70">
									{t("monthlyInstallment")}:
								</span>
								<span className="font-medium">
									{formatCurrencySimple(
										debt.monthly_amount,
										formattingLocale,
										resolvedCurrency,
									)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-base-content/70">{t("duration")}:</span>
								<span className="font-medium">
									{t("durationMonths", { count: debt.number_of_payments })}
								</span>
							</div>
							{debt.final_payment != null && debt.final_payment > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-base-content/70">
										{t("finalInstallment")}:
									</span>
									<span className="font-medium">
										{formatCurrencySimple(
											debt.final_payment,
											formattingLocale,
											resolvedCurrency,
										)}
									</span>
								</div>
							)}
							<div className="bg-base-300 rounded-lg p-3 mt-4">
								<div className="flex justify-between items-center">
									<span className="font-medium">{t("total")}:</span>
									<span className="font-bold text-xl">
										{formatCurrencySimple(
											totalAmount,
											formattingLocale,
											resolvedCurrency,
										)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Dates (conditional) */}
			{share.show_dates && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CalendarIcon className="w-5 h-5" />
							{t("dates")}
						</h2>
						<div className="space-y-4">
							<div>
								<div className="text-sm text-base-content/70 mb-1">
									{t("firstInstallment")}
								</div>
								<div className="font-medium">
									{formatDate(debt.first_payment_date, formattingLocale)}
								</div>
							</div>
							<div>
								<div className="text-sm text-base-content/70 mb-1">
									{t("lastInstallment")}
								</div>
								<div className="font-medium">
									{debt.final_payment_date
										? formatDate(debt.final_payment_date, formattingLocale)
										: tCommon("notSpecified")}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Payments list */}
			<SharedPaymentsList
				debt={debt}
				payments={payments}
				showAmounts={share.show_amounts}
				currency={resolvedCurrency}
				locale={formattingLocale}
			/>

			{/* Footer branding */}
			<div className="text-center pt-4">
				<p className="text-xs text-base-content/40">
					{tShare("sharedWithBrand")}
				</p>
			</div>
		</div>
	);
}

function SharedPaymentsList({
	debt,
	payments,
	showAmounts,
	currency,
	locale,
}: {
	debt: Debt;
	payments: Payment[];
	showAmounts: boolean;
	currency: string;
	locale: string;
}) {
	const t = useTranslations("share.debt");
	const allExpectedPayments = generateExpectedPayments(debt, payments);
	const extraPayments = payments.filter((p) => p.is_extra_payment && p.paid);

	const totalPaidPayments = allExpectedPayments.filter(
		(ep) => ep.payment?.paid,
	).length;
	const totalOverduePayments = allExpectedPayments.filter(
		(ep) => ep.isOverdue,
	).length;
	const totalPendingPayments = debt.number_of_payments - totalPaidPayments;

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="card-title text-lg">
						<CreditCardIcon className="w-5 h-5" />
						{t("paymentsList")}
					</h2>
					<div className="text-sm text-base-content/70">
						{t("paymentsMade", {
							paid: totalPaidPayments,
							total: debt.number_of_payments,
						})}
					</div>
				</div>

				{/* Summary stats */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="text-center p-2 bg-success/10 rounded-lg">
						<div className="text-lg font-bold text-success">
							{totalPaidPayments}
						</div>
						<div className="text-xs text-success/80">{t("paidShort")}</div>
					</div>
					<div className="text-center p-2 bg-error/10 rounded-lg">
						<div className="text-lg font-bold text-error">
							{totalOverduePayments}
						</div>
						<div className="text-xs text-error/80">{t("overdueShort")}</div>
					</div>
					<div className="text-center p-2 bg-warning/10 rounded-lg">
						<div className="text-lg font-bold text-warning">
							{totalPendingPayments}
						</div>
						<div className="text-xs text-warning/80">{t("pendingShort")}</div>
					</div>
				</div>

				{/* Extra payments section */}
				{extraPayments.length > 0 && (
					<div className="mb-4">
						<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
							<span className="badge badge-primary badge-sm">
								{extraPayments.length}
							</span>
							{t("customPayments")}
						</h3>
						{showAmounts && (
							<div className="text-sm font-medium text-base-content/70 px-2 mb-2">
								{t("totalExtraPayments", {
									amount: formatCurrencySimple(
										extraPayments.reduce(
											(sum, p) => sum + (p.actual_amount || 0),
											0,
										),
										locale,
										currency,
									),
								})}
							</div>
						)}
						<div className="grid grid-cols-1 gap-2">
							{extraPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20"
								>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-primary" />
										<span className="text-sm">
											{payment.paid_date
												? formatShortDate(payment.paid_date, locale)
												: formatMonthYear(payment.month, payment.year, locale)}
										</span>
									</div>
									{showAmounts && (
										<span className="font-mono text-sm font-semibold text-primary">
											{formatCurrencySimple(
												payment.actual_amount || 0,
												locale,
												currency,
											)}
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Payments table */}
				<div className="overflow-x-auto">
					<table className="table table-sm">
						<thead>
							<tr>
								<th>{t("period")}</th>
								<th>{t("status")}</th>
								{showAmounts && (
									<>
										<th className="text-right">{t("plannedAmount")}</th>
										<th className="text-right">{t("actualAmount")}</th>
									</>
								)}
								<th>{t("paymentDate")}</th>
							</tr>
						</thead>
						<tbody>
							{allExpectedPayments.map((ep) => {
								const isPaid = ep.payment?.paid || false;
								const hasExtraPayments = ep.extraPayments.length > 0;

								return (
									<tr
										key={`${ep.year}-${ep.month}`}
										className={
											isPaid ? "bg-success/5" : ep.isOverdue ? "bg-error/5" : ""
										}
									>
										<td>
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4 text-base-content/50" />
												<span className="font-medium">
													{formatMonthYear(ep.month, ep.year, locale)}
												</span>
											</div>
										</td>
										<td>
											<div className="flex items-center gap-2">
												{isPaid ? (
													<>
														<CheckCircle className="w-4 h-4 text-success" />
														<span className="badge badge-success badge-sm">
															{t("paidShort")}
														</span>
													</>
												) : ep.isOverdue ? (
													<>
														<XCircle className="w-4 h-4 text-error" />
														<span className="badge badge-error badge-sm">
															{t("overdueShort")}
														</span>
													</>
												) : (
													<>
														<Calendar className="w-4 h-4 text-warning" />
														<span className="badge badge-warning badge-sm">
															{t("pendingShort")}
														</span>
													</>
												)}
											</div>
										</td>
										{showAmounts && (
											<>
												<td className="text-right font-mono text-sm">
													{formatCurrencySimple(
														ep.planned_amount,
														locale,
														currency,
													)}
												</td>
												<td className="text-right font-mono text-sm">
													{isPaid ? (
														<span
															className={
																ep.totalActualAmount !== ep.planned_amount
																	? "text-warning font-medium"
																	: ""
															}
														>
															{formatCurrencySimple(
																ep.totalActualAmount,
																locale,
																currency,
															)}
														</span>
													) : hasExtraPayments ? (
														<span className="text-xs text-primary">
															{t("extraPaymentsCount", {
																count: ep.extraPayments.length,
															})}
														</span>
													) : (
														<span className="text-base-content/40">-</span>
													)}
												</td>
											</>
										)}
										<td className="text-sm text-base-content/70">
											{ep.payment?.paid_date ? (
												formatShortDate(ep.payment.paid_date, locale)
											) : (
												<span className="text-base-content/40">-</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
						{showAmounts && (
							<tfoot>
								<tr className="font-medium border-t-2">
									<td colSpan={2}>{t("total")}</td>
									<td className="text-right font-mono">
										{formatCurrencySimple(
											(debt.original_monthly_amount || debt.monthly_amount) *
												(debt.original_number_of_payments ||
													debt.number_of_payments),
											locale,
											currency,
										)}
									</td>
									<td className="text-right font-mono">
										{formatCurrencySimple(
											Math.min(
												allExpectedPayments.reduce(
													(sum, ep) => sum + ep.totalActualAmount,
													0,
												) +
													extraPayments.reduce(
														(sum, p) => sum + (p.actual_amount || 0),
														0,
													),
												(debt.down_payment || 0) +
													(debt.original_monthly_amount ||
														debt.monthly_amount) *
														(debt.original_number_of_payments ||
															debt.number_of_payments) +
													(debt.final_payment || 0),
											),
											locale,
											currency,
										)}
									</td>
									<td></td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			</div>
		</div>
	);
}
