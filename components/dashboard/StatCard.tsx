import type { ReactNode } from "react";

interface StatCardProps {
	title: string;
	value: string | number;
	description: string;
	icon: ReactNode;
	variant: "primary" | "secondary" | "accent" | "info";
}

export default function StatCard({
	title,
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
		<div className="bg-base-100 rounded-xl border border-base-300 p-3 sm:p-4 lg:p-5 hover:shadow-lg transition-shadow duration-200">
			<div className="flex items-start justify-between gap-2">
				<div className="flex-1 min-w-0">
					<div className="text-xs sm:text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1 sm:mb-2">
						{title}
					</div>
					<div className={`text-base sm:text-xl lg:text-2xl font-bold ${variantClasses[variant]}`}>
						{value}
					</div>
					<div className="text-xs sm:text-sm text-base-content/70 mt-0.5 sm:mt-1">{description}</div>
				</div>
				<div className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg shrink-0 ${iconBgClasses[variant]}`}>
					{icon}
				</div>
			</div>
		</div>
	);
}
