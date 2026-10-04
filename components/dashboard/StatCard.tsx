import type { ReactNode } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";

interface StatCardProps {
	title: string;
	monetary?: boolean;
	value: string | number;
	description: string;
	icon: ReactNode;
	variant: "primary" | "secondary" | "accent" | "info";
}

export default function StatCard({
	title,
	monetary = false,
	value,
	description,
	icon,
	variant,
}: StatCardProps) {
	const variantClasses = {
		primary: "text-primary",
		secondary: "text-secondary",
		accent: "text-accent",
		info: "text-info",
	};

	const iconBgClasses = {
		primary: "bg-primary/10 text-primary",
		secondary: "bg-secondary/10 text-secondary",
		accent: "bg-accent/10 text-accent",
		info: "bg-info/10 text-info",
	};

	return (
		<div className="min-w-0 bg-base-100 rounded-xl border border-base-300 p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-shadow duration-200">
			<div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2 gap-y-1">
				<div className="min-w-0 text-xs sm:text-sm font-medium text-base-content/60 uppercase tracking-wide [overflow-wrap:anywhere]">
					{title}
				</div>
				<div
					className={`col-span-2 sm:col-span-1 min-w-0 text-base sm:text-xl lg:text-2xl font-bold [overflow-wrap:anywhere] ${variantClasses[variant]}`}
				>
					{monetary ? <PrivateAmount>{value}</PrivateAmount> : value}
				</div>
				<div className="col-span-2 sm:col-span-1 min-w-0 text-xs sm:text-sm text-base-content/70 [overflow-wrap:anywhere]">
					{description}
				</div>
				<div
					className={`col-start-2 row-start-1 sm:row-span-3 flex items-center justify-center w-6 h-6 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg shrink-0 ${iconBgClasses[variant]}`}
				>
					{icon}
				</div>
			</div>
		</div>
	);
}
