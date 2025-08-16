"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import { usePasswordValidation } from "@/hooks/usePasswordValidation";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import ProfileForm from "./ProfileForm";

interface PasswordSectionProps {
	user: RecordModel;
	onMessage: (message: { type: string; text: string }) => void;
}

export default function PasswordSection({
	user,
	onMessage,
}: PasswordSectionProps) {
	const t = useTranslations("profile");

	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const { validatePasswordChange } = usePasswordValidation(t);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			onMessage,
			successMessage:
				t("passwordChanged") || "Password changed successfully!",
			errorMessage: t("passwordError") || "Failed to change password",
		});

	const resetPasswordData = () => {
		setPasswordData({
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();

		const success = await handleUpdate(
			{
				oldPassword: passwordData.currentPassword,
				password: passwordData.newPassword,
				passwordConfirm: passwordData.confirmPassword,
			},
			() =>
				validatePasswordChange(
					passwordData.newPassword,
					passwordData.confirmPassword,
				),
		);

		if (success) {
			resetPasswordData();
		}
	};

	return (
		<ProfileForm
			title={t("password") || "Password"}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => startEditing()}
			onSubmit={handlePasswordChange}
			onCancel={() => {
				cancelEditing();
				resetPasswordData();
			}}
			editButtonText={t("changePassword") || "Change Password"}
			submitButtonText={t("changePassword") || "Change Password"}
			displayContent={
				<p className="text-base-content/70">
					{t("passwordDescription") || "Change your current password"}
				</p>
			}
		>
			<FormInput
				label={t("currentPassword") || "Current Password"}
				type="password"
				value={passwordData.currentPassword}
				onChange={(value) =>
					setPasswordData({
						...passwordData,
						currentPassword: value,
					})
				}
				required
			/>

			<FormInput
				label={t("newPassword") || "New Password"}
				type="password"
				value={passwordData.newPassword}
				onChange={(value) =>
					setPasswordData({
						...passwordData,
						newPassword: value,
					})
				}
				required
			/>

			<FormInput
				label={t("confirmPassword") || "Confirm New Password"}
				type="password"
				value={passwordData.confirmPassword}
				onChange={(value) =>
					setPasswordData({
						...passwordData,
						confirmPassword: value,
					})
				}
				required
			/>
		</ProfileForm>
	);
}
