"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import type { ReactNode } from "react";
import AccountSection from "./AccountSection";
import DangerZone from "./DangerZone";
import EmailSection from "./EmailSection";
import PasswordSection from "./PasswordSection";
import PreferencesSection from "./PreferencesSection";

interface ProfileSettingsProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

function SettingsCard({
	id,
	title,
	hint,
	children,
}: {
	id: string;
	title: string;
	hint?: string;
	children: ReactNode;
}) {
	return (
		<section aria-labelledby={id} className="card bg-base-100 shadow-xl">
			<div className="card-body gap-0 p-5 sm:p-6">
				<h2
					id={id}
					className="text-xs font-medium uppercase tracking-wider text-base-content/50"
				>
					{title}
					{hint && (
						<span className="ml-2 normal-case tracking-normal italic">
							— {hint}
						</span>
					)}
				</h2>
				<div className="divide-y divide-base-200">{children}</div>
			</div>
		</section>
	);
}

export default function ProfileSettings({
	user,
	refreshUser,
}: ProfileSettingsProps) {
	const t = useTranslations("profile");

	return (
		<>
			<SettingsCard
				id="profile-preferences"
				title={t("groups.preferences")}
				hint={t("autosaveHint")}
			>
				<PreferencesSection user={user} refreshUser={refreshUser} />
			</SettingsCard>
			<SettingsCard id="profile-security" title={t("groups.security")}>
				<EmailSection user={user} />
				<PasswordSection user={user} />
			</SettingsCard>
			<SettingsCard id="profile-account" title={t("groups.account")}>
				<AccountSection user={user} />
			</SettingsCard>
			<DangerZone user={user} />
		</>
	);
}
