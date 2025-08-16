import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import UserAvatar from "@/components/ui/UserAvatar";

interface ProfileHeaderProps {
	user: RecordModel;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
	const t = useTranslations("profile");

	return (
		<div className="flex items-center gap-4 mb-6">
			<UserAvatar user={user} size="md" />
			<div>
				<h1 className="card-title text-2xl">
					{t("title") || "User Profile"}
				</h1>
				<p className="text-base-content/70">
					{t("subtitle") || "Manage your account settings"}
				</p>
			</div>
		</div>
	);
}
