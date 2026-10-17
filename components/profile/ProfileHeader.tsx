"use client";

import { ShareNetworkIcon } from "@phosphor-icons/react";
import { useFormatter, useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import ShareProfileModal from "@/components/dashboard/ShareProfileModal";
import UserAvatar from "@/components/ui/UserAvatar";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { nameSchema } from "@/lib/schemas";

interface ProfileHeaderProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function ProfileHeader({
	user,
	refreshUser,
}: ProfileHeaderProps) {
	const t = useTranslations("profile");
	const format = useFormatter();
	const [name, setName] = useState(user.name || "");
	const [showShare, setShowShare] = useState(false);

	useEffect(() => {
		setName(user.name || "");
	}, [user]);

	const { loading, handleUpdate } = useProfileUpdate({
		user,
		refreshUser,
		successMessage: t("profileUpdated"),
		errorMessage: t("updateError"),
	});

	const saveName = async () => {
		const trimmed = name.trim();
		if (trimmed === (user.name || "")) return;
		if (!nameSchema.safeParse({ name: trimmed }).success) {
			setName(user.name || "");
			return;
		}
		await handleUpdate({ name: trimmed });
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body flex-row items-center gap-4 p-5 sm:p-6">
				<UserAvatar user={user} size="lg" />
				<div className="min-w-0 flex-1">
					<h1 className="sr-only">{t("title")}</h1>
					<input
						type="text"
						aria-label={t("name")}
						className="input input-ghost input-sm -ml-3 w-full max-w-sm text-xl font-semibold"
						value={name}
						placeholder={t("namePlaceholder")}
						maxLength={100}
						disabled={loading}
						onChange={(e) => setName(e.target.value)}
						onBlur={saveName}
						onKeyDown={(e) => {
							if (e.key === "Enter") e.currentTarget.blur();
							if (e.key === "Escape") {
								setName(user.name || "");
								e.currentTarget.blur();
							}
						}}
					/>
					<p className="truncate text-sm text-base-content/60">
						{user.email}
						{user.created &&
							` · ${t("memberSince", {
								date: format.dateTime(new Date(user.created), {
									month: "short",
									year: "numeric",
								}),
							})}`}
					</p>
				</div>
				<button
					type="button"
					className="btn btn-outline btn-sm shrink-0"
					onClick={() => setShowShare(true)}
					aria-label={t("shareProfile")}
				>
					<ShareNetworkIcon size={16} />
					<span className="hidden sm:inline">{t("shareProfile")}</span>
				</button>
			</div>
			<ShareProfileModal
				isOpen={showShare}
				onClose={() => setShowShare(false)}
			/>
		</div>
	);
}
