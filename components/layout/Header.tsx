"use client";

import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/language-selector";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function Header() {
	const t = useTranslations();

	return (
		<header className="bg-base-200 shadow-lg">
			<div className="navbar container mx-auto">
				<div className="flex-1">
					<h1 className="btn btn-ghost text-xl font-bold">
						{t("nav.title")}
					</h1>
				</div>
				<div className="flex-none flex gap-2">
					<LanguageSelector />
					<button className="btn btn-primary btn-sm">
						+ {t("nav.addDebt")}
					</button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
