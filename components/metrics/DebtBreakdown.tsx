"use client";

import { ChartBarHorizontalIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useCurrency } from "@/hooks/useCurrency";
import { type BreakdownGroup, calculateBreakdown } from "@/lib/metrics";
import type { Debt, Payment } from "@/lib/types";

interface DebtBreakdownProps {
	debts: Debt[];
	payments: Payment[];
}

const GROUPS: BreakdownGroup[] = ["debt", "entity"];

export default function DebtBreakdown({ debts, payments }: DebtBreakdownProps) {
	const t = useTranslations("metrics.breakdown");
	const { formatCurrency } = useCurrency();
	const [group, setGroup] = useState<BreakdownGroup>("debt");
	const rows = useMemo(
		() => calculateBreakdown(debts, payments, group),
		[debts, payments, group],
	);
	const total = rows.reduce((sum, row) => sum + row.remaining, 0);

	return (
		<section className="card bg-base-100 border border-base-300">
			<div className="card-body p-4 sm:p-6 gap-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h2 className="card-title text-lg">
							<ChartBarHorizontalIcon className="w-5 h-5" />
							{t("title")}
						</h2>
						<p className="text-sm text-base-content/60">{t("subtitle")}</p>
					</div>
					<div className="join">
						{GROUPS.map((option) => (
							<button
								key={option}
								type="button"
								aria-pressed={group === option}
								className={`btn btn-xs join-item ${group === option ? "btn-primary" : "btn-ghost"}`}
								onClick={() => setGroup(option)}
							>
								{t(option)}
							</button>
						))}
					</div>
				</div>

				{rows.length === 0 ? (
					<p className="text-sm text-base-content/60">{t("empty")}</p>
				) : (
					<ul className="space-y-3 max-h-80 overflow-y-auto">
						{rows.map((row) => {
							const percent = (row.remaining / total) * 100;
							return (
								<li key={row.key}>
									<div className="flex items-baseline justify-between gap-3 text-sm">
										<span className="min-w-0 truncate">
											{row.label || t("noEntity")}
										</span>
										<span className="shrink-0 font-medium">
											<PrivateAmount>
												{formatCurrency(row.remaining)}
											</PrivateAmount>
											<span className="ml-2 font-normal text-base-content/60">
												{Math.round(percent)}%
											</span>
										</span>
									</div>
									<div className="mt-1 h-2 rounded-full bg-base-200">
										<div
											className="h-full rounded-full bg-primary"
											style={{ width: `${percent}%` }}
										/>
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</section>
	);
}
