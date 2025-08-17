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
		<div className="bg-base-100 rounded-xl border border-base-300 p-6 hover:shadow-lg transition-shadow duration-200">
			<div className="flex items-start justify-between mb-4">
				<div
					className={`p-3 rounded-lg bg-gradient-to-br ${
						variant === "primary"
							? "from-primary/10 to-primary/20"
							: variant === "secondary"
								? "from-secondary/10 to-secondary/20"
								: variant === "accent"
									? "from-accent/10 to-accent/20"
									: "from-info/10 to-info/20"
					}`}
				>
					<div className={variantClasses[variant]}>{icon}</div>
				</div>
			</div>

			<div className="space-y-1">
				<p className="text-sm font-medium text-base-content/60 uppercase tracking-wide">
					{title}
				</p>
				<p className={`text-2xl font-bold ${variantClasses[variant]}`}>
					{value}
				</p>
				<p className="text-sm text-base-content/70">{description}</p>
			</div>
		</div>
	);
}
