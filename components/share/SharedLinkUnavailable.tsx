"use client";

import { WarningCircle } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function SharedLinkUnavailable() {
	const t = useTranslations("share.unavailable");
	const tShare = useTranslations("share");

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
			<WarningCircle className="w-16 h-16 text-base-content/30 mb-4" />
			<h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
			<p className="text-base-content/70 max-w-sm">{t("description")}</p>
			<div className="mt-6 text-sm text-base-content/40">{tShare("brand")}</div>
		</div>
	);
}
