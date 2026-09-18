"use client";

import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AmountPrivacyToggle() {
	const { user, setHideAmounts, savingPrivacy } = useAuth();
	const t = useTranslations("privacy");
	if (!user) return null;
	const hidden = user.hide_amounts === true;
	const label = t(hidden ? "show" : "hide");

	return (
		<button
			type="button"
			className="btn btn-ghost btn-sm gap-2"
			aria-label={label}
			title={label}
			aria-pressed={hidden}
			disabled={savingPrivacy}
			onClick={async () => {
				try {
					await setHideAmounts(!hidden);
				} catch {
					toast.error(t("saveError"));
				}
			}}
		>
			{savingPrivacy ? (
				<span className="loading loading-spinner loading-xs" />
			) : hidden ? (
				<EyeSlashIcon size={20} />
			) : (
				<EyeIcon size={20} />
			)}
			<span className="hidden sm:inline">{label}</span>
		</button>
	);
}
