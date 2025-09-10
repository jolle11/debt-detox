"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import SkeletonAuthCheck from "@/components/ui/skeletons/SkeletonAuthCheck";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
	children: ReactNode;
	fallback?: ReactNode;
}

export default function ProtectedRoute({
	children,
	fallback,
}: ProtectedRouteProps) {
	const { user, loading } = useAuth();
	const t = useTranslations("auth.restricted");

	if (loading) {
		return <SkeletonAuthCheck />;
	}

	if (!user) {
		return (
			fallback || (
				<div className="flex items-center justify-center min-h-screen">
					<div className="text-center">
						<h2 className="text-2xl font-bold mb-4">
							{t("title")}
						</h2>
						<p className="text-gray-600">{t("message")}</p>
					</div>
				</div>
			)
		);
	}

	return <>{children}</>;
}
