"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";

export function useToast() {
	const t = useTranslations("toast");

	return {
		success: (key: string) => toast.success(t(key)),
		error: (key: string, fallback?: string) => toast.error(fallback || t(key)),
		info: (message: string) => toast.info(message),
		warning: (message: string) => toast.warning(message),
		raw: toast,
	};
}
