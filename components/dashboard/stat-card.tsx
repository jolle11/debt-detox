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
		<div className="stat bg-base-200 rounded-box shadow">
			<div className={`stat-figure ${variantClasses[variant]}`}>
				{icon}
			</div>
			<div className="stat-title">{title}</div>
			<div className={`stat-value ${variantClasses[variant]}`}>
				{value}
			</div>
			<div className="stat-desc">{description}</div>
		</div>
	);
}
