"use client";

import { useTranslations } from "next-intl";
import AmountPrivacyToggle from "@/components/ui/AmountPrivacyToggle";

export default function PrivacySection() {
	const t = useTranslations("privacy");
	return (
		<section className="card bg-base-100 shadow">
			<div className="card-body">
				<div className="flex items-center justify-between gap-4">
					<h2 className="card-title">{t("title")}</h2>
					<AmountPrivacyToggle />
				</div>
				<p className="text-sm text-base-content/70">{t("description")}</p>
			</div>
		</section>
	);
}
