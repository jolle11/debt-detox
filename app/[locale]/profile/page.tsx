"use client";

import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileSettings from "@/components/profile/ProfileSettings";
import SkeletonProfile from "@/components/ui/skeletons/SkeletonProfile";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function ProfilePage() {
	const { user, loading } = useAuthRedirect();
	const { refreshUser } = useAuth();

	if (loading) {
		return <SkeletonProfile />;
	}

	if (!user) {
		return null;
	}

	return (
		<div className="max-w-2xl mx-auto space-y-4">
			<ProfileHeader user={user} refreshUser={refreshUser} />
			<ProfileSettings user={user} refreshUser={refreshUser} />
		</div>
	);
}
