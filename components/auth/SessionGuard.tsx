"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getLocalizedPath } from "@/lib/seo";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SessionGuard() {
	const t = useTranslations();
	const locale = useLocale();
	const router = useRouter();
	const { user } = useAuth();
	const hasHandledExpirationRef = useRef(false);

	useEffect(() => {
		if (!user) {
			hasHandledExpirationRef.current = false;
		}
	}, [user]);

	useAuthGuard({
		checkInterval: 5 * 60 * 1000, // Check every 5 minutes
		onSessionExpired: async () => {
			if (hasHandledExpirationRef.current) return;

			hasHandledExpirationRef.current = true;

			toast.warning(t("auth.session.expired"), {
				duration: 10000,
			});

			router.replace(getLocalizedPath(locale, "/"));
		},
	});

	return null;
}
