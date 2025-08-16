"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
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

	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleUpdate = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		onMessage({ type: "", text: "" });

		try {
			await pb
				.collection(user?.collectionName || "users")
				.update(user?.id, {
					name: formData.name,
				});

			await refreshUser();
			onMessage({
				type: "success",
				text: t("profileUpdated") || "Profile updated successfully!",
			});
			setIsEditing(false);
		} catch (error: any) {
			onMessage({
				type: "error",
				text:
					error?.message ||
					t("updateError") ||
					"Failed to update profile",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<ProfileForm
			title={t("name") || "Name"}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => {
				setFormData({ name: user?.name || "" });
				setIsEditing(true);
			}}
			onSubmit={handleUpdate}
			onCancel={() => {
				setIsEditing(false);
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
			<div className="form-control">
				<label className="label pb-2">
					<span className="label-text font-medium">
						{t("name") || "Name"}
					</span>
				</label>
				<input
					type="text"
					className="input input-bordered w-full"
					value={formData.name}
					onChange={(e) =>
						setFormData({
							...formData,
							name: e.target.value,
						})
					}
					placeholder={t("namePlaceholder") || "Enter your name"}
				/>
			</div>
		</ProfileForm>
	);
}
