"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";

interface EmailSectionProps {
	user: RecordModel;
}

export default function EmailSection({ user }: EmailSectionProps) {
	const t = useTranslations("profile");

	return (
		<>
			<div className="divider">{t("email") || "Email"}</div>

			<div className="space-y-4">
				<div>
					<p className="text-base-content text-lg">{user.email}</p>
				</div>
			</div>
		</>
	);
}
