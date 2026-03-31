"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { type NameFormData, nameSchema } from "@/lib/schemas";
import ProfileForm from "./ProfileForm";

interface NameSectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function NameSection({ user, refreshUser }: NameSectionProps) {
	const t = useTranslations("profile");
	const tv = useTranslations("validation");

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<NameFormData>({
		resolver: zodResolver(nameSchema),
		defaultValues: {
			name: user?.name || "",
		},
	});

	useEffect(() => {
		if (user) {
			reset({ name: user.name || "" });
		}
	}, [user, reset]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			successMessage: t("profileUpdated"),
			errorMessage: t("updateError"),
		});

	const onSubmit = async (data: NameFormData) => {
		await handleUpdate({ name: data.name });
	};

	return (
		<ProfileForm
			title={t("name") || "Name"}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => {
				reset({ name: user?.name || "" });
				startEditing();
			}}
			onSubmit={handleSubmit(onSubmit)}
			onCancel={() => {
				cancelEditing();
				reset({ name: user?.name || "" });
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
				registration={register("name")}
				placeholder={t("namePlaceholder") || "Enter your name"}
				error={errors.name?.message ? tv("maxLength", { max: 100 }) : undefined}
			/>
		</ProfileForm>
	);
}
