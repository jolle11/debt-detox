import { ChartBarIcon, PlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function EmptyState() {
	const t = useTranslations();

	return (
		<div className="text-center py-12">
			<div className="mb-4">
				<ChartBarIcon
					size={64}
					className="mx-auto text-base-content/30"
				/>
			</div>
			<h3 className="text-xl font-semibold mb-2">
				{t("dashboard.empty.title")}
			</h3>
			<p className="text-base-content/70 mb-4 max-w-md mx-auto">
				{t("dashboard.empty.description")}
			</p>
			<button className="btn btn-primary gap-2">
				<PlusIcon size={16} />
				{t("dashboard.empty.addButton")}
			</button>
		</div>
	);
}
