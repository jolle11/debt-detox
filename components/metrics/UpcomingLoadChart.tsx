"use client";

import { ChartBarIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { calculateUpcomingLoad, niceMax } from "@/lib/metrics";
import type { Debt, Payment } from "@/lib/types";

interface UpcomingLoadChartProps {
	debts: Debt[];
	payments: Payment[];
}

const WIDTH = 520;
const HEIGHT = 240;
const PAD = { top: 16, right: 8, bottom: 28, left: 52 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

export default function UpcomingLoadChart({
	debts,
	payments,
}: UpcomingLoadChartProps) {
	const t = useTranslations("metrics.load");
	const locale = useLocale();
	const { formatCurrency } = useCurrency();
	const { user } = useAuth();
	const hideAmounts = user?.hide_amounts === true;
	const [hover, setHover] = useState<number | null>(null);
	const { points, relief } = useMemo(
		() => calculateUpcomingLoad(debts, payments),
		[debts, payments],
	);

	const monthLabel = (period: string) =>
		new Date(`${period}-01T00:00:00`).toLocaleDateString(locale, {
			month: "short",
			year: "numeric",
		});
	const header = (
		<div>
			<h2 className="card-title text-lg">
				<ChartBarIcon className="w-5 h-5" />
				{t("title")}
			</h2>
			<p className="text-sm text-base-content/60">{t("subtitle")}</p>
		</div>
	);

	if (points.length === 0) {
		return (
			<section className="card bg-base-100 border border-base-300">
				<div className="card-body p-4 sm:p-6 gap-3">
					{header}
					<p className="text-sm text-base-content/60">{t("empty")}</p>
				</div>
			</section>
		);
	}

	const max = niceMax(Math.max(...points.map((p) => p.amount)));
	const step = PLOT_W / points.length;
	const barWidth = Math.max(1, step - 2);
	const y = (value: number) => PAD.top + PLOT_H - (value / max) * PLOT_H;
	const ticks = [0, 0.5, 1].map((f) => f * max);
	const compact = new Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
	});
	const yearTicks = points
		.map((p, i) => ({ p, i }))
		.filter(({ p }, idx) => idx === 0 || p.period.endsWith("-01"));
	const yearStep = Math.max(1, Math.ceil(yearTicks.length / 6));

	const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const ratio = ((event.clientX - rect.left) / rect.width) * WIDTH;
		const index = Math.floor((ratio - PAD.left) / step);
		setHover(Math.min(points.length - 1, Math.max(0, index)));
	};

	const hovered = hover === null ? null : points[hover];

	return (
		<section className="card bg-base-100 border border-base-300">
			<div className="card-body p-4 sm:p-6 gap-3">
				{header}
				{relief && (
					<p className="text-sm font-medium">
						{t("relief", {
							date: monthLabel(relief.period),
							amount: hideAmounts ? "••••" : formatCurrency(relief.amount),
						})}
					</p>
				)}

				<div className="relative">
					<svg
						viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
						className="w-full h-auto touch-none select-none"
						role="img"
						aria-label={t("title")}
						onPointerMove={onPointerMove}
						onPointerLeave={() => setHover(null)}
					>
						{ticks.map((value) => (
							<g key={value}>
								<line
									x1={PAD.left}
									x2={WIDTH - PAD.right}
									y1={y(value)}
									y2={y(value)}
									stroke="currentColor"
									className="text-base-content/10"
								/>
								<text
									x={PAD.left - 8}
									y={y(value)}
									textAnchor="end"
									dominantBaseline="middle"
									className="fill-base-content/60 text-[11px]"
								>
									{hideAmounts ? "••" : compact.format(value)}
								</text>
							</g>
						))}
						{yearTicks
							.filter((_, idx) => idx % yearStep === 0)
							.map(({ p, i }) => (
								<text
									key={p.period}
									x={PAD.left + i * step}
									y={HEIGHT - 8}
									textAnchor="start"
									className="fill-base-content/60 text-[11px]"
								>
									{p.period.slice(0, 4)}
								</text>
							))}
						{points.map((p, i) => (
							<rect
								key={p.period}
								x={PAD.left + i * step + (step - barWidth) / 2}
								y={y(p.amount)}
								width={barWidth}
								height={y(0) - y(p.amount)}
								rx={Math.min(2, barWidth / 2)}
								fill="var(--color-primary)"
								opacity={hover === null || hover === i ? 1 : 0.45}
							/>
						))}
					</svg>

					{hovered && hover !== null && (
						<div
							className="absolute top-0 pointer-events-none rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-md"
							style={{
								left: `${((PAD.left + (hover + 0.5) * step) / WIDTH) * 100}%`,
								transform:
									hover > points.length / 2
										? "translateX(calc(-100% - 8px))"
										: "translateX(8px)",
							}}
						>
							<div className="text-base-content/60">
								{monthLabel(hovered.period)}
							</div>
							<div className="font-semibold text-base-content">
								<PrivateAmount>{formatCurrency(hovered.amount)}</PrivateAmount>
							</div>
						</div>
					)}
				</div>

				<details className="text-sm">
					<summary className="cursor-pointer text-base-content/60">
						{t("showTable")}
					</summary>
					<div className="max-h-64 overflow-y-auto mt-2">
						<table className="table table-xs">
							<thead>
								<tr>
									<th>{t("month")}</th>
									<th className="text-right">{t("amount")}</th>
								</tr>
							</thead>
							<tbody>
								{points.map((p) => (
									<tr key={p.period}>
										<td>{monthLabel(p.period)}</td>
										<td className="text-right">
											<PrivateAmount>{formatCurrency(p.amount)}</PrivateAmount>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</details>
			</div>
		</section>
	);
}
