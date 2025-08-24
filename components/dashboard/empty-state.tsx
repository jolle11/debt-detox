import { ChartBarIcon, PlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { DebtFilterType } from "@/hooks/use-debt-filter";

interface EmptyStateProps {
	filterType?: DebtFilterType;
	onAddDebt?: () => void;
}

export default function EmptyState({
	filterType = "all",
	onAddDebt,
}: EmptyStateProps) {
	const t = useTranslations();

	// Different messages based on filter type
	const getEmptyStateContent = () => {
		switch (filterType) {
			case "active":
				return {
					title: t("emptyStates.active.title"),
					description: t("emptyStates.active.description"),
					buttonText: t("emptyStates.active.buttonText"),
				};
			case "completed":
				return {
					title: t("emptyStates.completed.title"),
					description: t("emptyStates.completed.description"),
					buttonText: null, // No mostrar botón en completadas
				};
			default:
				return {
					title: t("dashboard.empty.title"),
					description: t("dashboard.empty.description"),
					buttonText: t("dashboard.empty.addButton"),
				};
		}
	};

	const content = getEmptyStateContent();

	return (
		<div className="text-center py-12">
			<div className="mb-4">
				<ChartBarIcon
					size={64}
					className="mx-auto text-base-content/30"
				/>
			</div>
			<h3 className="text-xl font-semibold mb-2">{content.title}</h3>
			<p className="text-base-content/70 mb-4 max-w-md mx-auto">
				{content.description}
			</p>
			{content.buttonText && (
				<button className="btn btn-primary gap-2" onClick={onAddDebt}>
					<PlusIcon size={16} />
					{content.buttonText}
				</button>
			)}
		</div>
	);
}
