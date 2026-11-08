import { CaretRightIcon, ChartLineUpIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function MetricsLink() {
	const t = useTranslations("metrics");

	return (
		<Link
			href="/metrics"
			className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow duration-200"
		>
			<div className="card-body flex-row items-center gap-4 p-5 sm:p-6">
				<ChartLineUpIcon className="w-6 h-6 shrink-0 text-primary" />
				<div className="min-w-0 flex-1">
					<div className="font-semibold">{t("title")}</div>
					<p className="text-sm text-base-content/60">{t("subtitle")}</p>
				</div>
				<CaretRightIcon className="w-4 h-4 shrink-0 text-base-content/50" />
			</div>
		</Link>
	);
}
