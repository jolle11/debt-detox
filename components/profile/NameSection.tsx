"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

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
		<>
			<div className="divider">{t("name") || "Name"}</div>

			{!isEditing ? (
				<div className="space-y-4">
					<div>
						<p className="text-base-content text-lg">
							{user.name || t("noName") || "No name set"}
						</p>
					</div>

					<button
						className="btn btn-outline btn-sm"
						onClick={() => {
							setFormData({ name: user?.name || "" });
							setIsEditing(true);
						}}
					>
						{t("editName") || "Edit Name"}
					</button>
				</div>
			) : (
				<form onSubmit={handleUpdate} className="space-y-6">
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
							placeholder={
								t("namePlaceholder") || "Enter your name"
							}
						/>
					</div>

					<div className="flex gap-3 pt-2">
						<button
							type="submit"
							className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
							disabled={loading}
						>
							{t("save") || "Save"}
						</button>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={() => {
								setIsEditing(false);
								setFormData({ name: user?.name || "" });
							}}
						>
							{t("cancel") || "Cancel"}
						</button>
					</div>
				</form>
			)}
		</>
	);
}
