"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SessionGuard() {
	const t = useTranslations();

	useAuthGuard({
		checkInterval: 5 * 60 * 1000, // Check every 5 minutes
		onSessionExpired: () => {
			toast.warning(t("auth.session.expired"), {
				duration: 10000,
			});
		},
	});

	return null;
}
