"use client";

import { CaretDownIcon } from "@phosphor-icons/react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import DebtActivityList from "@/components/collaboration/DebtActivityList";
import SplitEditor from "@/components/collaboration/SplitEditor";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useCurrency } from "@/hooks/useCurrency";
import type { Debt } from "@/lib/types";
import {
	calculateMonthlyContribution,
	hasParticipants,
	otherParticipantNames,
} from "@/utils/debtCalculations";

export default function DebtCollaboration({ debt }: { debt: Debt }) {
	const t = useTranslations("collaboration");
	const format = useFormatter();
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const { invitations, isSaving, respond, remove } = useCollaboration(debt.id);
	const [removing, setRemoving] = useState<string | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [editing, setEditing] = useState(false);
	const owner = debt.user_id === user?.id;
	const shared = hasParticipants(debt);
	const canSplit = owner && !debt.completed_at;
	const pending = invitations.find(
		(i) =>
			i.status === "pending" && new Date(i.expires_at).getTime() > Date.now(),
	);
	if (!shared && !(owner && pending) && !canSplit) return null;
	const people = debt.participants ?? [];

	return (
		<section className="card bg-base-100 border border-base-300 p-4 mb-5 space-y-3">
			{editing ? (
				<SplitEditor debt={debt} onClose={() => setEditing(false)} />
			) : (
				<div className="flex items-center justify-between gap-3">
					{shared ? (
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
									name: otherParticipantNames(debt, user?.id, t("member")),
								})}{" "}
								· {people.map((person) => person.percent).join("/")}
							</span>
						</button>
					) : (
						<p className="min-w-0 flex-1 text-base-content/70">
							{t("split.invite")}
						</p>
					)}
					{canSplit && (
						<button
							type="button"
							className="btn btn-outline btn-sm shrink-0"
							onClick={() => setEditing(true)}
						>
							{t(shared ? "split.edit" : "split.start")}
						</button>
					)}
				</div>
			)}

			{shared && expanded && !editing && (
				<ul className="space-y-2 text-base-content/80">
					<li>
						{t("yourMonthly")}:{" "}
						<PrivateAmount>
							{formatCurrency(calculateMonthlyContribution(debt))}
						</PrivateAmount>
					</li>
					<li>
						{t("totalMonthly")}:{" "}
						<PrivateAmount>{formatCurrency(debt.monthly_amount)}</PrivateAmount>
					</li>
					{people.map((person, index) => {
						const removable =
							owner && person.user_id && person.user_id !== user?.id;
						return (
							<li
								key={person.user_id || `${person.name}-${index}`}
								className="flex flex-wrap items-center justify-between gap-2 border-t border-base-200 pt-2"
							>
								<span>
									{person.user_id === user?.id
										? t("split.you")
										: person.name || t("member")}{" "}
									· {person.percent} % ·{" "}
									<PrivateAmount>
										{formatCurrency(
											(debt.monthly_amount * person.percent) / 100,
										)}
									</PrivateAmount>
								</span>
								{removable && removing !== person.user_id && (
									<button
										type="button"
										className="btn btn-error btn-xs"
										onClick={() => setRemoving(person.user_id ?? null)}
									>
										{t("remove")}
									</button>
								)}
								{removable && removing === person.user_id && (
									<div className="w-full space-y-2">
										<p>{t("removeHelp")}</p>
										<div className="flex justify-end gap-2">
											<button
												type="button"
												className="btn btn-error btn-sm"
												disabled={isSaving}
												onClick={async () => {
													try {
														await remove(person.user_id as string);
														setRemoving(null);
													} catch {
														toast.error(t("actionError"));
													}
												}}
											>
												{t("remove")}
											</button>
											<button
												type="button"
												className="btn btn-ghost btn-sm"
												onClick={() => setRemoving(null)}
											>
												{t("cancel")}
											</button>
										</div>
									</div>
								)}
							</li>
						);
					})}
					<li className="text-sm text-base-content/60">{t("paymentHelp")}</li>
				</ul>
			)}
			{shared && expanded && !editing && debt.id && (
				<DebtActivityList debtId={debt.id} />
			)}

			{owner && pending && (
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
						type="button"
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
			)}
		</section>
	);
}
