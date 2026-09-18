"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCollaboration } from "@/hooks/useCollaboration";

export default function InvitationInbox() {
	const t = useTranslations("collaboration");
	const { invitations, isSaving, respond, error } = useCollaboration();
	if (error)
		return (
			<p role="alert" className="text-error text-sm">
				{t("loadError")}
			</p>
		);
	if (!invitations.length) return null;
	return (
		<section className="card bg-base-100 border border-primary/30 p-4 space-y-3">
			<h2 className="font-semibold">{t("invitations")}</h2>
			<p className="text-sm text-base-content/70">{t("acceptHelp")}</p>
			{invitations.map((invitation) => (
				<div
					key={invitation.id}
					className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300 pt-3"
				>
					<div>
						<p className="font-medium">{invitation.debt_name}</p>
						<p className="text-sm text-base-content/70">
							{t("from", { name: invitation.sender_name })}
						</p>
					</div>
					<div className="flex gap-2">
						{(["accept", "reject"] as const).map((action) => (
							<button
								type="button"
								key={action}
								className={`btn btn-sm ${action === "accept" ? "btn-primary" : "btn-ghost"}`}
								disabled={isSaving}
								onClick={async () => {
									try {
										await respond(invitation.id, action);
										toast.success(
											t(action === "accept" ? "accepted" : "rejected"),
										);
									} catch {
										toast.error(t("actionError"));
									}
								}}
							>
								{t(action)}
							</button>
						))}
					</div>
				</div>
			))}
		</section>
	);
}
