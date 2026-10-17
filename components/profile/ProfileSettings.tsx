"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import AmountFormatSection from "./AmountFormatSection";
import CurrencySection from "./CurrencySection";
import EmailSection from "./EmailSection";
import NameSection from "./NameSection";
import PasswordSection from "./PasswordSection";
import PrivacySection from "./PrivacySection";

interface ProfileSettingsProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function ProfileSettings({
	user,
	refreshUser,
}: ProfileSettingsProps) {
	const t = useTranslations("profile");

	return (
		<div className="space-y-5">
			<section aria-labelledby="profile-personal">
				<h2
					id="profile-personal"
					className="text-xs font-medium uppercase tracking-wider text-base-content/50"
				>
					{t("groups.personal")}
				</h2>
				<div className="divide-y divide-base-200">
					<NameSection user={user} refreshUser={refreshUser} />
					<EmailSection user={user} />
				</div>
			</section>
			<section aria-labelledby="profile-preferences">
				<h2
					id="profile-preferences"
					className="text-xs font-medium uppercase tracking-wider text-base-content/50"
				>
					{t("groups.preferences")}
				</h2>
				<div className="divide-y divide-base-200">
					<CurrencySection user={user} refreshUser={refreshUser} />
					<AmountFormatSection user={user} refreshUser={refreshUser} />
					<PrivacySection />
				</div>
			</section>
			<section aria-labelledby="profile-security">
				<h2
					id="profile-security"
					className="text-xs font-medium uppercase tracking-wider text-base-content/50"
				>
					{t("groups.security")}
				</h2>
				<PasswordSection user={user} />
			</section>
		</div>
	);
}
