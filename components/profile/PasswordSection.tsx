"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import {
	type PasswordChangeFormData,
	passwordChangeSchema,
} from "@/lib/schemas";
import ProfileForm from "./ProfileForm";

interface PasswordSectionProps {
	user: RecordModel;
}

export default function PasswordSection({ user }: PasswordSectionProps) {
	const t = useTranslations("profile");
	const tv = useTranslations("validation");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<PasswordChangeFormData>({
		resolver: zodResolver(passwordChangeSchema),
		defaultValues: {
			currentPassword: "",
			newPassword: "",
			confirmPassword: "",
		},
	});

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			successMessage: t("passwordChanged"),
			errorMessage: t("passwordError"),
		});

	const onSubmit = async (data: PasswordChangeFormData) => {
		const success = await handleUpdate({
			oldPassword: data.currentPassword,
			password: data.newPassword,
			passwordConfirm: data.confirmPassword,
		});

		if (success) {
			reset();
		}
	};

	return (
		<ProfileForm
			title={t("password") || "Password"}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => startEditing()}
			onSubmit={handleSubmit(onSubmit)}
			onCancel={() => {
				cancelEditing();
				reset();
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
				registration={register("currentPassword")}
				error={errors.currentPassword?.message ? tv("required") : undefined}
			/>

			<FormInput
				label={t("newPassword") || "New Password"}
				type="password"
				registration={register("newPassword")}
				error={
					errors.newPassword?.message ? tv("minLength", { min: 8 }) : undefined
				}
			/>

			<FormInput
				label={t("confirmPassword") || "Confirm New Password"}
				type="password"
				registration={register("confirmPassword")}
				error={
					errors.confirmPassword?.message ? tv("passwordMismatch") : undefined
				}
			/>
		</ProfileForm>
	);
}
