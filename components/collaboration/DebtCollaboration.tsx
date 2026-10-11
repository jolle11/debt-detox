"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import DebtActivityList from "@/components/collaboration/DebtActivityList";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useCurrency } from "@/hooks/useCurrency";
import { useCollaboration } from "@/hooks/useCollaboration";
import type { Debt } from "@/lib/types";

export default function DebtCollaboration({ debt }: { debt: Debt }) {
	const t = useTranslations("collaboration");
	const format = useFormatter();
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const { invitations, isSaving, respond, remove } = useCollaboration(debt.id);
	const [confirmRemove, setConfirmRemove] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const owner = debt.user_id === user?.id;
	const pending = invitations.find(
		(i) =>
			i.status === "pending" && new Date(i.expires_at).getTime() > Date.now(),
	);
	if (!debt.collaborator_id && !(owner && pending)) return null;
	return (
		<section className="card bg-base-100 border border-base-300 p-4 mb-5 space-y-3">
			{debt.collaborator_id ? (
				<>
					<div className="flex items-center justify-between gap-3">
						<button
							type="button"
							className="flex min-w-0 flex-1 items-center gap-2 text-left"
							onClick={() => setExpanded((value) => !value)}
							aria-expanded={expanded}
						>
							<CaretDownIcon
								size={18}
								className={`shrink-0 transition-transform motion-reduce:transition-none ${expanded ? "rotate-180" : ""}`}
								aria-hidden="true"
							/>
							<span>
								{t("with", {
									name: owner
										? debt.collaborator_name || t("member")
										: debt.owner_name || t("member"),
								})}{" "}
								· 50/50
							</span>
						</button>
						{owner && !confirmRemove && (
							<button
								className="btn btn-error btn-sm shrink-0"
								onClick={() => setConfirmRemove(true)}
							>
								{t("remove")}
							</button>
						)}
					</div>
					{owner && confirmRemove && (
						<div className="space-y-2">
							<p>{t("removeHelp")}</p>
							<div className="flex justify-end gap-2">
								<button
									className="btn btn-error btn-sm"
									disabled={isSaving}
									onClick={async () => {
										try {
											await remove();
											setConfirmRemove(false);
										} catch {
											toast.error(t("actionError"));
										}
									}}
								>
									{t("remove")}
								</button>
								<button
									className="btn btn-ghost btn-sm"
									onClick={() => setConfirmRemove(false)}
								>
									{t("cancel")}
								</button>
							</div>
						</div>
					)}
					{expanded && (
						<ul className="list-disc space-y-3 pl-5 text-base-content/80">
							<li>
								{t("yourMonthly")}:{" "}
								<PrivateAmount>
									{formatCurrency(debt.monthly_amount / 2)}
								</PrivateAmount>
							</li>
							<li>
								{t("totalMonthly")}:{" "}
								<PrivateAmount>
									{formatCurrency(debt.monthly_amount)}
								</PrivateAmount>
							</li>
							<li className="text-sm text-base-content/60">
								{t("paymentHelp")}
							</li>
						</ul>
					)}
					{expanded && debt.id && <DebtActivityList debtId={debt.id} />}
				</>
			) : (
				pending && (
					<div className="flex flex-wrap items-center gap-3">
						<p>
							{t("pending", {
								name: pending.recipient_name,
								date: format.dateTime(new Date(pending.expires_at), {
									day: "numeric",
									month: "short",
								}),
							})}
						</p>
						<button
							className="btn btn-ghost btn-sm"
							disabled={isSaving}
							onClick={async () => {
								try {
									await respond(pending.id, "cancel");
								} catch {
									toast.error(t("actionError"));
								}
							}}
						>
							{t("cancelInvitation")}
						</button>
					</div>
				)
			)}
		</section>
	);
}
