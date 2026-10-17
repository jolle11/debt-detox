"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useState } from "react";
import { toast } from "sonner";
import pb from "@/lib/pocketbase";
import ProfileForm from "./ProfileForm";

interface EmailSectionProps {
	user: RecordModel;
}

export default function EmailSection({ user }: EmailSectionProps) {
	const t = useTranslations("profile");
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [email, setEmail] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await pb
				.collection(user.collectionName || "users")
				.requestEmailChange(email.trim());
			toast.success(t("emailChangeRequested"));
			setIsEditing(false);
			setEmail("");
		} catch (error) {
			toast.error(
				(error instanceof Error && error.message) || t("emailChangeError"),
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ProfileForm
			title={t("email")}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => setIsEditing(true)}
			onSubmit={handleSubmit}
			onCancel={() => {
				setIsEditing(false);
				setEmail("");
			}}
			editLabel={t("change")}
			editButtonText={t("changeEmail")}
			submitButtonText={t("changeEmail")}
			displayContent={user.email}
		>
			<label className="form-control w-full">
				<span className="label-text mb-1">{t("newEmail")}</span>
				<input
					type="email"
					required
					className="input input-bordered w-full"
					value={email}
					placeholder={t("emailPlaceholder")}
					onChange={(e) => setEmail(e.target.value)}
				/>
			</label>
			<p className="text-xs text-base-content/60">{t("emailChangeHint")}</p>
		</ProfileForm>
	);
}
