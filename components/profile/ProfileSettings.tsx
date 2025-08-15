"use client";

import type { RecordModel } from "pocketbase";
import { useState } from "react";
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
	const [message, setMessage] = useState({ type: "", text: "" });

	return (
		<div className="space-y-6">
			{message.text && (
				<div
					className={`alert ${message.type === "success" ? "alert-success" : "alert-error"} mb-4`}
				>
					<span>{message.text}</span>
				</div>
			)}

			<NameSection
				user={user}
				refreshUser={refreshUser}
				onMessage={setMessage}
			/>

			<EmailSection user={user} />

			<PasswordSection user={user} onMessage={setMessage} />
		</div>
	);
}
