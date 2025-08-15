"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslations } from "next-intl";
import UserAvatar from "@/components/ui/UserAvatar";
import NotLoggedIn from "@/components/profile/NotLoggedIn";
import ProfileSettings from "@/components/profile/ProfileSettings";

export default function ProfilePage() {
	const { user, refreshUser } = useAuth();
	const t = useTranslations("profile");

	if (!user) {
		return <NotLoggedIn />;
	}

	return (
		<div className="max-w-2xl mx-auto">
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<div className="flex items-center gap-4 mb-6">
						<UserAvatar user={user} size="md" />
						<div>
							<h1 className="card-title text-2xl">
								{t("title") || "User Profile"}
							</h1>
							<p className="text-base-content/70">
								{t("subtitle") ||
									"Manage your account settings"}
							</p>
						</div>
					</div>

					<ProfileSettings user={user} refreshUser={refreshUser} />
				</div>
			</div>
		</div>
	);
}
