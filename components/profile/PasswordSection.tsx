"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useState } from "react";
import pb from "@/lib/pocketbase";

interface PasswordSectionProps {
	user: RecordModel;
	onMessage: (message: { type: string; text: string }) => void;
}

export default function PasswordSection({
	user,
	onMessage,
}: PasswordSectionProps) {
	const t = useTranslations("profile");

	const [isChanging, setIsChanging] = useState(false);
	const [passwordData, setPasswordData] = useState({
		currentPassword: "",
		newPassword: "",
		confirmPassword: "",
	});
	const [loading, setLoading] = useState(false);

	const handlePasswordChange = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		onMessage({ type: "", text: "" });

		if (passwordData.newPassword !== passwordData.confirmPassword) {
			onMessage({
				type: "error",
				text: t("passwordMismatch") || "Passwords don't match",
			});
			setLoading(false);
			return;
		}

		try {
			await pb.collection("users").update(user?.id, {
				oldPassword: passwordData.currentPassword,
				password: passwordData.newPassword,
				passwordConfirm: passwordData.confirmPassword,
			});

			onMessage({
				type: "success",
				text: t("passwordChanged") || "Password changed successfully!",
			});
			setIsChanging(false);
			setPasswordData({
				currentPassword: "",
				newPassword: "",
				confirmPassword: "",
			});
		} catch (error: any) {
			onMessage({
				type: "error",
				text:
					error?.message ||
					t("passwordError") ||
					"Failed to change password",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="divider">{t("password") || "Password"}</div>

			{!isChanging ? (
				<div className="space-y-4">
					<p className="text-base-content/70">
						{t("passwordDescription") ||
							"Change your current password"}
					</p>

					<button
						className="btn btn-outline"
						onClick={() => setIsChanging(true)}
					>
						{t("changePassword") || "Change Password"}
					</button>
				</div>
			) : (
				<form onSubmit={handlePasswordChange} className="space-y-6">
					<div className="form-control">
						<label className="label pb-2">
							<span className="label-text font-medium">
								{t("currentPassword") || "Current Password"}
							</span>
						</label>
						<input
							type="password"
							className="input input-bordered w-full"
							value={passwordData.currentPassword}
							onChange={(e) =>
								setPasswordData({
									...passwordData,
									currentPassword: e.target.value,
								})
							}
							required
						/>
					</div>

					<div className="form-control">
						<label className="label pb-2">
							<span className="label-text font-medium">
								{t("newPassword") || "New Password"}
							</span>
						</label>
						<input
							type="password"
							className="input input-bordered w-full"
							value={passwordData.newPassword}
							onChange={(e) =>
								setPasswordData({
									...passwordData,
									newPassword: e.target.value,
								})
							}
							required
						/>
					</div>

					<div className="form-control">
						<label className="label pb-2">
							<span className="label-text font-medium">
								{t("confirmPassword") || "Confirm New Password"}
							</span>
						</label>
						<input
							type="password"
							className="input input-bordered w-full"
							value={passwordData.confirmPassword}
							onChange={(e) =>
								setPasswordData({
									...passwordData,
									confirmPassword: e.target.value,
								})
							}
							required
						/>
					</div>

					<div className="flex gap-3 pt-2">
						<button
							type="submit"
							className={`btn btn-primary ${loading ? "loading" : ""}`}
							disabled={loading}
						>
							{t("changePassword") || "Change Password"}
						</button>
						<button
							type="button"
							className="btn btn-ghost"
							onClick={() => {
								setIsChanging(false);
								setPasswordData({
									currentPassword: "",
									newPassword: "",
									confirmPassword: "",
								});
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
