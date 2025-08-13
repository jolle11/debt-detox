import { useTranslations } from "next-intl";
import type { DebtFilterType } from "@/hooks/use-debt-filter";

interface DebtFilterTabsProps {
	activeFilter: DebtFilterType;
	onFilterChange: (filter: DebtFilterType) => void;
	counts: {
		all: number;
		active: number;
		completed: number;
	};
}

export default function DebtFilterTabs({
	activeFilter,
	onFilterChange,
	counts,
}: DebtFilterTabsProps) {
	const t = useTranslations();

	const tabs = [
		{
			id: "all" as const,
			label: t("dashboard.tabs.all"),
			count: counts.all,
		},
		{
			id: "active" as const,
			label: t("dashboard.tabs.active"),
			count: counts.active,
		},
		{
			id: "completed" as const,
			label: t("dashboard.tabs.completed"),
			count: counts.completed,
		},
	];

	return (
		<div className="bg-base-200 p-1 rounded-lg mb-6 inline-flex gap-1">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => onFilterChange(tab.id)}
					className={`relative px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 ease-in-out flex items-center gap-2 min-w-fit ${
						activeFilter === tab.id
							? "bg-primary text-primary-content shadow-sm"
							: "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
					}`}
				>
					<span className="font-semibold">{tab.label}</span>
					{tab.count > 0 && (
						<span
							className={`text-xs font-bold px-2 py-1 rounded-full min-w-[24px] flex items-center justify-center ${
								activeFilter === tab.id
									? "bg-primary-content/20 text-primary-content"
									: "bg-base-300 text-base-content/80"
							}`}
						>
							{tab.count}
						</span>
					)}
					{activeFilter === tab.id && (
						<div className="absolute inset-0 rounded-md bg-primary/10 -z-10" />
					)}
				</button>
			))}
		</div>
	);
}
