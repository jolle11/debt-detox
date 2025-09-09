"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProfileSettings from "@/components/profile/ProfileSettings";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SkeletonProfile from "@/components/ui/skeletons/SkeletonProfile";
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
		<div className="max-w-2xl mx-auto">
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body">
					<ProfileHeader user={user} />
					<ProfileSettings user={user} refreshUser={refreshUser} />
				</div>
			</div>
		</div>
	);
}
