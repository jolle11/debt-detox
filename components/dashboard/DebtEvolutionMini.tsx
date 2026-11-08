"use client";

import { ArrowRightIcon, ChartLineIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Link } from "@/i18n/routing";
import { calculateDebtEvolution } from "@/lib/debtEvolution";
import type { Debt, Payment } from "@/lib/types";

interface DebtEvolutionMiniProps {
	debts: Debt[];
	payments: Payment[];
}

const WIDTH = 600;
const HEIGHT = 56;
const INSET = 4;

export default function DebtEvolutionMini({
	debts,
	payments,
}: DebtEvolutionMiniProps) {
	const t = useTranslations("metrics");
	const points = useMemo(
		() => calculateDebtEvolution(debts, payments),
		[debts, payments],
	);

	if (points.length < 2) return null;

	const max = Math.max(1, ...points.map((p) => p.remaining));
	const x = (i: number) => (i / (points.length - 1)) * WIDTH;
	const y = (value: number) => INSET + (1 - value / max) * (HEIGHT - INSET * 2);
	const path = (from: number, to: number) =>
		points
			.slice(from, to + 1)
			.map((p, i) => `${i === 0 ? "M" : "L"}${x(from + i)},${y(p.remaining)}`)
			.join(" ");
	const lastActual = points.findLastIndex((p) => !p.projected);

	return (
		<Link
			href="/metrics"
			className="card bg-base-100 border border-base-300 hover:shadow-lg transition-shadow duration-200"
		>
			<div className="card-body flex-row flex-wrap items-center gap-x-6 gap-y-2 p-4">
				<div className="flex items-center gap-2 font-semibold">
					<ChartLineIcon className="w-5 h-5" />
					{t("evolution.title")}
				</div>
				<svg
					viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
					preserveAspectRatio="none"
					className="order-last sm:order-none w-full sm:w-auto sm:flex-1 h-10 min-w-0"
					aria-hidden="true"
				>
					{lastActual >= 0 && (
						<path
							d={path(0, lastActual)}
							fill="none"
							stroke="var(--color-primary)"
							strokeWidth="2"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
					)}
					{lastActual < points.length - 1 && (
						<path
							d={path(Math.max(lastActual, 0), points.length - 1)}
							fill="none"
							stroke="var(--color-primary)"
							strokeWidth="2"
							strokeDasharray="5 4"
							strokeLinejoin="round"
							vectorEffect="non-scaling-stroke"
						/>
					)}
				</svg>
				<span className="ml-auto sm:ml-0 flex items-center gap-1 text-sm text-base-content/70">
					{t("viewMetrics")}
					<ArrowRightIcon className="w-4 h-4" />
				</span>
			</div>
		</Link>
	);
}
