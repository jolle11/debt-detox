"use client";

import { ReceiptIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useAuth } from "@/contexts/AuthContext";
import type { DebtDetailProps } from "@/data/debtDetail";
import { analyzeFinancing, calculateOutstandingCapital } from "@/lib/financing";

function Stat({ label, children }: { label: string; children: ReactNode }) {
	return (
		<div className="min-w-0">
			<div className="text-xs text-base-content/60">{label}</div>
			<div className="font-semibold tabular-nums">{children}</div>
		</div>
	);
}

export default function DebtFinancing({
	debt,
	payments,
	formatCurrency,
}: DebtDetailProps) {
	const t = useTranslations("debtDetail.financing");
	const locale = useLocale();
	const { user } = useAuth();
	const analysis = analyzeFinancing(debt);
	const { plan, tin, tae } = analysis;

	if (!plan && tin === null && tae === null && !analysis.inconsistent) {
		if (debt.user_id !== user?.id) return null;
		return (
			<div className="card bg-base-100 shadow">
				<div className="card-body p-5">
					<h2 className="card-title text-xl">
						<ReceiptIcon className="w-6 h-6" />
						{t("title")}
					</h2>
					<p className="text-sm text-base-content/60">{t("addData")}</p>
				</div>
			</div>
		);
	}

	const percent = (value: number) =>
		`${new Intl.NumberFormat(locale, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(value)} %`;
	const money = (value: number) => (
		<PrivateAmount>{formatCurrency(value)}</PrivateAmount>
	);
	const monthLabel = (period: string) =>
		new Date(`${period}-01T00:00:00`).toLocaleDateString(locale, {
			month: "short",
			year: "numeric",
		});

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5 gap-4">
				<div>
					<h2 className="card-title text-xl">
						<ReceiptIcon className="w-6 h-6" />
						{t("title")}
					</h2>
					<p className="text-sm text-base-content/60">{t("assumption")}</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					{tin !== null && (
						<Stat label={analysis.tinIsImplied ? t("tinImplied") : t("tin")}>
							{percent(tin)}
						</Stat>
					)}
					{tae !== null && (
						<Stat label={analysis.taeIsImplied ? t("taeImplied") : t("tae")}>
							{percent(tae)}
						</Stat>
					)}
					{plan && (
						<>
							<Stat label={t("financed")}>{money(plan.financed)}</Stat>
							<Stat label={t("interest")}>{money(plan.interest)}</Stat>
							{plan.fee > 0 && <Stat label={t("fee")}>{money(plan.fee)}</Stat>}
							<Stat label={t("totalCost")}>
								{money(plan.totalCost)}{" "}
								<span className="font-normal text-base-content/60">
									{percent(plan.costPercent)}
								</span>
							</Stat>
							<Stat label={t("capitalOutstanding")}>
								{money(calculateOutstandingCapital(debt, plan, payments))}
							</Stat>
						</>
					)}
				</div>

				{analysis.ratesDiffer && (
					<p className="text-sm bg-warning/20 rounded-lg p-3">
						{t("ratesDiffer")}
					</p>
				)}
				{analysis.inconsistent && (
					<p className="text-sm bg-warning/20 rounded-lg p-3">
						{t("inconsistent")}
					</p>
				)}
				{!plan && !analysis.inconsistent && (
					<p className="text-sm text-base-content/60">{t("addData")}</p>
				)}

				{plan && (
					<details className="text-sm">
						<summary className="cursor-pointer text-base-content/60">
							{t("showTable")}
						</summary>
						<div className="max-h-80 overflow-auto mt-2">
							<table className="table table-xs table-pin-rows">
								<thead>
									<tr>
										<th>{t("month")}</th>
										<th className="text-right">{t("payment")}</th>
										<th className="text-right">{t("interest")}</th>
										<th className="text-right">{t("capital")}</th>
										<th className="text-right">{t("balance")}</th>
									</tr>
								</thead>
								<tbody>
									{plan.rows.map((row) => (
										<tr key={row.period}>
											<td>{monthLabel(row.period)}</td>
											<td className="text-right">{money(row.payment)}</td>
											<td className="text-right">{money(row.interest)}</td>
											<td className="text-right">{money(row.capital)}</td>
											<td className="text-right">{money(row.balance)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</details>
				)}
			</div>
		</div>
	);
}
