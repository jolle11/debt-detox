"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import FormInput from "@/components/ui/FormInput";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import ProfileForm from "./ProfileForm";

interface NameSectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
	onMessage: (message: { type: string; text: string }) => void;
}

export default function NameSection({
	user,
	refreshUser,
	onMessage,
}: NameSectionProps) {
	const t = useTranslations("profile");

	const [formData, setFormData] = useState({
		name: user?.name || "",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				name: user.name || "",
			});
		}
	}, [user]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			onMessage,
			successMessage:
				t("profileUpdated") || "Profile updated successfully!",
			errorMessage: t("updateError") || "Failed to update profile",
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleUpdate({ name: formData.name });
	};

	return (
		<ProfileForm
			title={t("name") || "Name"}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => {
				setFormData({ name: user?.name || "" });
				startEditing();
			}}
			onSubmit={handleSubmit}
			onCancel={() => {
				cancelEditing();
				setFormData({ name: user?.name || "" });
			}}
			editButtonText={t("editName") || "Edit Name"}
			displayContent={
				<div>
					<p className="text-base-content text-lg">
						{user.name || t("noName") || "No name set"}
					</p>
				</div>
			}
		>
			<FormInput
				label={t("name") || "Name"}
				type="text"
				value={formData.name}
				onChange={(value) =>
					setFormData({
						...formData,
						name: value,
					})
				}
				placeholder={t("namePlaceholder") || "Enter your name"}
			/>
		</ProfileForm>
	);
}
