"use client";

import type { RecordModel } from "pocketbase";
import CurrencySection from "./CurrencySection";
import EmailSection from "./EmailSection";
import NameSection from "./NameSection";
import PasswordSection from "./PasswordSection";

interface ProfileSettingsProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function ProfileSettings({
	user,
	refreshUser,
}: ProfileSettingsProps) {
	return (
		<div className="space-y-6">
			<NameSection user={user} refreshUser={refreshUser} />

			<EmailSection user={user} />

			<CurrencySection user={user} refreshUser={refreshUser} />

			<PasswordSection user={user} />
		</div>
	);
}
