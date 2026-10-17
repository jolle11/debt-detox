"use client";

import { useTranslations } from "next-intl";
import AmountPrivacyToggle from "@/components/ui/AmountPrivacyToggle";

export default function PrivacySection() {
	const t = useTranslations("privacy");
	return (
		<div className="flex items-center justify-between gap-4 py-3">
			<div className="min-w-0">
				<p className="text-sm" id="profile-privacy-title">
					{t("hide")}
				</p>
				<p
					id="profile-privacy-description"
					className="mt-0.5 max-w-md text-xs leading-relaxed text-base-content/60"
				>
					{t("description")}
				</p>
			</div>
			<AmountPrivacyToggle variant="switch" />
		</div>
	);
}
