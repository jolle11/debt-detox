"use client";

import { useFormatter, useTranslations } from "next-intl";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useCurrency } from "@/hooks/useCurrency";
import { useDebtActivity } from "@/hooks/useDebtActivity";

export default function DebtActivityList({ debtId }: { debtId: string }) {
	const t = useTranslations("collaboration.activity");
	const format = useFormatter();
	const { formatCurrency } = useCurrency();
	const { data: activity = [], isLoading, isError } = useDebtActivity(debtId);

	return (
		<div className="space-y-2">
			<h3 className="font-semibold">{t("title")}</h3>
			{isLoading ? (
				<p className="text-sm text-base-content/60">{t("loading")}</p>
			) : isError ? (
				<p className="text-sm text-error">{t("loadError")}</p>
			) : activity.length === 0 ? (
				<p className="text-sm text-base-content/60">{t("empty")}</p>
			) : (
				<ul className="space-y-2 text-sm">
					{activity.map((entry) => (
						<li
							key={entry.id}
							className="flex flex-wrap items-baseline justify-between gap-x-3"
						>
							<span>
								<span className="font-medium">{entry.actor_name}</span>{" "}
								{t(`actions.${entry.action}`, {
									period:
										entry.year && entry.month
											? format.dateTime(
													new Date(entry.year, entry.month - 1, 1),
													{ month: "short", year: "numeric" },
												)
											: "",
								})}
								{entry.amount ? (
									<>
										{" · "}
										<PrivateAmount>
											{formatCurrency(entry.amount)}
										</PrivateAmount>
									</>
								) : null}
							</span>
							<time
								className="text-xs text-base-content/60"
								dateTime={entry.created}
							>
								{format.dateTime(new Date(entry.created), {
									day: "numeric",
									month: "short",
									hour: "2-digit",
									minute: "2-digit",
								})}
							</time>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
