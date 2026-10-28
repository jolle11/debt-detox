"use client";

import { FlaskIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import type { DebtPaymentDetailsProps } from "@/data/debtDetail";
import { parseDateOnly } from "@/lib/dateOnly";
import { simulateExtraPayment, simulateMonthlyExtra } from "@/lib/simulator";

function parseAmount(value: string) {
	const amount = Number.parseFloat(value.replace(",", "."));
	return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export default function DebtSimulator({
	debt,
	paymentStats,
	formatCurrency,
}: DebtPaymentDetailsProps) {
	const t = useTranslations("debtDetail.simulator");
	const locale = useLocale();
	const [lumpSum, setLumpSum] = useState("");
	const [monthlyExtra, setMonthlyExtra] = useState("");

	if (debt.completed_at || paymentStats.pendingAmount <= 0) return null;

	const lump = Math.min(parseAmount(lumpSum), paymentStats.pendingAmount);
	const extra = parseAmount(monthlyExtra);
	const remainingInstallments = Math.max(
		0,
		debt.number_of_payments - paymentStats.registeredPaidPayments,
	);
	const strategies = lump
		? simulateExtraPayment(debt, paymentStats, lump)
		: null;
	const projection = extra
		? simulateMonthlyExtra(
				Math.max(0, paymentStats.pendingAmount - lump),
				debt.monthly_amount,
				remainingInstallments,
				extra,
			)
		: null;
	const formatMonth = (date: string) =>
		parseDateOnly(date)?.toLocaleDateString(locale, {
			month: "long",
			year: "numeric",
		}) ?? date;

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5 gap-4">
				<div>
					<h2 className="card-title text-xl">
						<FlaskIcon className="w-6 h-6" />
						{t("title")}
					</h2>
					<p className="text-sm text-base-content/60">{t("description")}</p>
				</div>

				<label className="form-control">
					<span className="label-text mb-1">{t("lumpSum")}</span>
					<input
						type="number"
						inputMode="decimal"
						min="0"
						step="0.01"
						className="input input-bordered input-sm w-full"
						value={lumpSum}
						onChange={(event) => setLumpSum(event.target.value)}
						placeholder="0"
					/>
				</label>

				{strategies && (
					<ul className="text-sm space-y-2">
						<li className="flex justify-between gap-2">
							<span className="text-base-content/70">
								{t("reduceInstallments")}
							</span>
							<span className="font-medium text-right">
								{t("installmentsLeft", {
									count: strategies.reduce_installments.remainingInstallments,
								})}
								{remainingInstallments >
									strategies.reduce_installments.remainingInstallments && (
									<span className="badge badge-success badge-sm ml-1">
										-
										{remainingInstallments -
											strategies.reduce_installments.remainingInstallments}
									</span>
								)}
							</span>
						</li>
						<li className="flex justify-between gap-2">
							<span className="text-base-content/70">{t("reduceAmount")}</span>
							<span className="font-medium">
								<PrivateAmount>
									{formatCurrency(strategies.reduce_amount.monthlyAmount)}
								</PrivateAmount>
								{t("perMonth")}
							</span>
						</li>
					</ul>
				)}

				<div className="divider my-0" />

				<label className="form-control">
					<span className="label-text mb-1">{t("monthlyExtra")}</span>
					<input
						type="number"
						inputMode="decimal"
						min="0"
						step="0.01"
						className="input input-bordered input-sm w-full"
						value={monthlyExtra}
						onChange={(event) => setMonthlyExtra(event.target.value)}
						placeholder="0"
					/>
				</label>

				{projection && (
					<div className="rounded-lg bg-base-200 p-3 text-sm space-y-1">
						<div>
							{t("payoffIn", {
								count: projection.months,
								date: formatMonth(projection.payoffDate),
							})}
						</div>
						{projection.monthsSaved > 0 && (
							<div className="text-success font-medium">
								{t("monthsSaved", { count: projection.monthsSaved })}
							</div>
						)}
					</div>
				)}

				<p className="text-xs text-base-content/50">{t("disclaimer")}</p>
			</div>
		</div>
	);
}
