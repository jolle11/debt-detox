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

	return (
		<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
			<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
				{title}
			</div>
			<div className={`text-xl font-bold ${variantClasses[variant]}`}>
				{value}
			</div>
			<div className="text-sm text-base-content/70 mt-1">{description}</div>
		</div>
	);
}
