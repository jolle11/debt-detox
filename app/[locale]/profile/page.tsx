"use client";

import { useAuth } from "@/contexts/AuthContext";
import NotLoggedIn from "@/components/profile/NotLoggedIn";
import ProfileSettings from "@/components/profile/ProfileSettings";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SkeletonProfile from "@/components/ui/skeletons/SkeletonProfile";

export default function ProfilePage() {
	const { user, loading, refreshUser } = useAuth();

	if (loading) {
		return <SkeletonProfile />;
	}

	if (!user) {
		return <NotLoggedIn />;
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
