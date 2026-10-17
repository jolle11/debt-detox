"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";

interface EmailSectionProps {
	user: RecordModel;
}

export default function EmailSection({ user }: EmailSectionProps) {
	const t = useTranslations("profile");

	return (
		<div className="py-3">
			<p className="text-xs text-base-content/60">{t("email")}</p>
			<p className="mt-1 break-words text-sm">{user.email}</p>
		</div>
	);
}
