"use client";

import { ChartLineIcon } from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/hooks/useCurrency";
import { calculateDebtEvolution } from "@/lib/debtEvolution";
import type { Debt, Payment } from "@/lib/types";

interface DebtEvolutionChartProps {
	debts: Debt[];
	payments: Payment[];
}

const WIDTH = 720;
const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 64 };
const PLOT_W = WIDTH - PAD.left - PAD.right;
const PLOT_H = HEIGHT - PAD.top - PAD.bottom;

function niceMax(value: number) {
	if (value <= 0) return 1;
	const magnitude = 10 ** Math.floor(Math.log10(value));
	const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4) ?? 10;
	return Math.ceil(value / (step * magnitude)) * step * magnitude;
}

export default function DebtEvolutionChart({
	debts,
	payments,
}: DebtEvolutionChartProps) {
	const t = useTranslations("dashboard.evolution");
	const locale = useLocale();
	const { formatCurrency } = useCurrency();
	const [hover, setHover] = useState<number | null>(null);
	const { user } = useAuth();
	const hideAmounts = user?.hide_amounts === true;

	const points = useMemo(
		() => calculateDebtEvolution(debts, payments),
		[debts, payments],
	);

	if (points.length < 2) return null;

	const max = niceMax(Math.max(...points.map((p) => p.remaining)));
	const x = (i: number) => PAD.left + (i / (points.length - 1)) * PLOT_W;
	const y = (value: number) => PAD.top + PLOT_H - (value / max) * PLOT_H;
	const path = (from: number, to: number) =>
		points
			.slice(from, to + 1)
			.map((p, i) => `${i === 0 ? "M" : "L"}${x(from + i)},${y(p.remaining)}`)
			.join(" ");

	const lastActual = points.findLastIndex((p) => !p.projected);
	const hasProjection = lastActual < points.length - 1;
	const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
	const compact = new Intl.NumberFormat(locale, {
		notation: "compact",
		maximumFractionDigits: 1,
	});
	const monthLabel = (period: string) =>
		new Date(`${period}-01T00:00:00`).toLocaleDateString(locale, {
			month: "short",
			year: "numeric",
		});
	const yearTicks = points
		.map((p, i) => ({ p, i }))
		.filter(({ p }, idx) => idx === 0 || p.period.endsWith("-01"));
	const yearStep = Math.max(1, Math.ceil(yearTicks.length / 8));

	const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
		const rect = event.currentTarget.getBoundingClientRect();
		const ratio = ((event.clientX - rect.left) / rect.width) * WIDTH;
		const index = Math.round(
			((ratio - PAD.left) / PLOT_W) * (points.length - 1),
		);
		setHover(Math.min(points.length - 1, Math.max(0, index)));
	};

	const hovered = hover === null ? null : points[hover];

	return (
		<section className="card bg-base-100 border border-base-300">
			<div className="card-body p-4 sm:p-6 gap-3">
				<div className="flex flex-wrap items-start justify-between gap-2">
					<div>
						<h2 className="card-title text-lg">
							<ChartLineIcon className="w-5 h-5" />
							{t("title")}
						</h2>
						<p className="text-sm text-base-content/60">{t("subtitle")}</p>
					</div>
					<div className="flex items-center gap-4 text-xs text-base-content/70">
						<span className="flex items-center gap-1.5">
							<svg width="20" height="4" aria-hidden="true">
								<line
									x1="0"
									y1="2"
									x2="20"
									y2="2"
									stroke="var(--color-primary)"
									strokeWidth="2"
								/>
							</svg>
							{t("actual")}
						</span>
						{hasProjection && (
							<span className="flex items-center gap-1.5">
								<svg width="20" height="4" aria-hidden="true">
									<line
										x1="0"
										y1="2"
										x2="20"
										y2="2"
										stroke="var(--color-primary)"
										strokeWidth="2"
										strokeDasharray="4 3"
									/>
								</svg>
								{t("projected")}
							</span>
						)}
					</div>
				</div>

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
									x={x(i)}
									y={HEIGHT - 8}
									textAnchor={i === 0 ? "start" : "middle"}
									className="fill-base-content/60 text-[11px]"
								>
									{p.period.slice(0, 4)}
								</text>
							))}

						<path
							d={`${path(0, lastActual)} L${x(lastActual)},${y(0)} L${x(0)},${y(0)} Z`}
							fill="var(--color-primary)"
							opacity="0.08"
						/>
						<path
							d={path(0, lastActual)}
							fill="none"
							stroke="var(--color-primary)"
							strokeWidth="2"
							strokeLinejoin="round"
						/>
						{hasProjection && (
							<path
								d={path(lastActual, points.length - 1)}
								fill="none"
								stroke="var(--color-primary)"
								strokeWidth="2"
								strokeDasharray="5 4"
								strokeLinejoin="round"
							/>
						)}
						<circle
							cx={x(lastActual)}
							cy={y(points[lastActual].remaining)}
							r="4"
							fill="var(--color-primary)"
							stroke="var(--color-base-100)"
							strokeWidth="2"
						/>

						{hover !== null && (
							<g pointerEvents="none">
								<line
									x1={x(hover)}
									x2={x(hover)}
									y1={PAD.top}
									y2={PAD.top + PLOT_H}
									stroke="currentColor"
									className="text-base-content/30"
								/>
								<circle
									cx={x(hover)}
									cy={y(points[hover].remaining)}
									r="5"
									fill="var(--color-primary)"
									stroke="var(--color-base-100)"
									strokeWidth="2"
								/>
							</g>
						)}
					</svg>

					{hovered && hover !== null && (
						<div
							className="absolute top-0 pointer-events-none rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-xs shadow-md"
							style={{
								left: `${(x(hover) / WIDTH) * 100}%`,
								transform:
									hover > points.length / 2
										? "translateX(calc(-100% - 8px))"
										: "translateX(8px)",
							}}
						>
							<div className="text-base-content/60">
								{monthLabel(hovered.period)}
								{hovered.projected && ` · ${t("projected")}`}
							</div>
							<div className="font-semibold text-base-content">
								<PrivateAmount>
									{formatCurrency(hovered.remaining)}
								</PrivateAmount>
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
									<th className="text-right">{t("remaining")}</th>
								</tr>
							</thead>
							<tbody>
								{points.map((p) => (
									<tr key={p.period}>
										<td>
											{monthLabel(p.period)}
											{p.projected && (
												<span className="text-base-content/50">
													{" "}
													· {t("projected")}
												</span>
											)}
										</td>
										<td className="text-right">
											<PrivateAmount>
												{formatCurrency(p.remaining)}
											</PrivateAmount>
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
