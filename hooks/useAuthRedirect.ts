"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseAuthRedirectOptions {
	redirectTo?: string;
	redirectWhen?: "unauthenticated" | "authenticated";
}

export function useAuthRedirect({
	redirectTo = "/",
	redirectWhen = "unauthenticated",
}: UseAuthRedirectOptions = {}) {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;

		const shouldRedirect =
			(redirectWhen === "unauthenticated" && !user) ||
			(redirectWhen === "authenticated" && user);

		if (shouldRedirect) {
			router.push(redirectTo);
		}
	}, [user, loading, router, redirectTo, redirectWhen]);

	return { user, loading };
}
