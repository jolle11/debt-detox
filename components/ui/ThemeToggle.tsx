"use client";

import { useTranslations } from "next-intl";
import { type ThemeMode, useTheme } from "@/hooks/useTheme";

export default function ThemeToggle() {
	const { theme, changeTheme } = useTheme();
	const t = useTranslations("theme");

	const themes: { value: ThemeMode; label: string; icon: string }[] = [
		{ value: "light", label: t("light"), icon: "☀️" },
		{ value: "dark", label: t("dark"), icon: "🌙" },
		{ value: "system", label: t("system"), icon: "💻" },
	];

	return (
		<div className="dropdown dropdown-end">
			<div
				tabIndex={0}
				role="button"
				className="btn btn-ghost btn-circle"
				title={t("changeTheme")}
			>
				<span className="text-lg">
					{themes.find((t) => t.value === theme)?.icon || "💻"}
				</span>
			</div>
			<ul
				tabIndex={0}
				className="menu dropdown-content bg-base-100 rounded-box z-[1] w-40 p-2 shadow border border-base-300"
			>
				{themes.map(({ value, label, icon }) => (
					<li key={value}>
						<button
							onClick={() => changeTheme(value)}
							className={`flex items-center gap-2 ${
								theme === value ? "active" : ""
							}`}
						>
							<span>{icon}</span>
							<span>{label}</span>
							{theme === value && (
								<span className="ml-auto text-primary">✓</span>
							)}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
