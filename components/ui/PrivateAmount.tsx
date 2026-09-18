"use client";

import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function PrivateAmount({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const t = useTranslations("privacy");
	const hidden = user?.hide_amounts === true;

	return (
		<span className="inline-block" data-private-amount data-hidden={hidden}>
			<span
				aria-hidden={hidden || undefined}
				className={
					hidden ? "inline-block tracking-widest select-none" : undefined
				}
			>
				{hidden ? "••••" : children}
			</span>
			{hidden && <span className="sr-only">{t("hiddenAmount")}</span>}
		</span>
	);
}
