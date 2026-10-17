import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import UserAvatar from "@/components/ui/UserAvatar";

interface ProfileHeaderProps {
	user: RecordModel;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
	const t = useTranslations("profile");

	return (
		<div className="flex items-center gap-3 mb-3">
			<UserAvatar user={user} size="md" />
			<div>
				<h1 className="card-title text-xl">{t("title")}</h1>
				<p className="text-sm text-base-content/60">{t("subtitle")}</p>
			</div>
		</div>
	);
}
