"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useCurrency } from "@/hooks/useCurrency";
import { useCollaboration } from "@/hooks/useCollaboration";
import type { Debt } from "@/lib/types";

export default function DebtCollaboration({ debt }: { debt: Debt }) {
	const t = useTranslations("collaboration");
	const format = useFormatter();
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const { invitations, isLoading, error, isSaving, invite, respond, remove } =
		useCollaboration(debt.id);
	const [email, setEmail] = useState("");
	const [confirmRemove, setConfirmRemove] = useState(false);
	const owner = debt.user_id === user?.id;
	const pending = invitations.find(
		(i) =>
			i.status === "pending" && new Date(i.expires_at).getTime() > Date.now(),
	);
	return (
		<section className="card bg-base-100 border border-base-300 p-4 mb-5 space-y-3">
			<h2 className="font-semibold">{t("title")}</h2>
			{debt.collaborator_id ? (
				<>
					<p>
						{t("with", {
							name: owner
								? debt.collaborator_name || t("member")
								: debt.owner_name || t("member"),
						})}{" "}
						· 50/50
					</p>
					<p>
						{t("yourMonthly")}:{" "}
						<PrivateAmount>
							{formatCurrency(debt.monthly_amount / 2)}
						</PrivateAmount>{" "}
						· {t("totalMonthly")}:{" "}
						<PrivateAmount>{formatCurrency(debt.monthly_amount)}</PrivateAmount>
					</p>
					<p className="text-sm text-base-content/70">{t("paymentHelp")}</p>
					{owner &&
						(confirmRemove ? (
							<div className="space-y-2">
								<p>{t("removeHelp")}</p>
								<div className="flex gap-2">
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
						) : (
							<button
								className="btn btn-ghost btn-sm self-start"
								onClick={() => setConfirmRemove(true)}
							>
								{t("remove")}
							</button>
						))}
				</>
			) : (
				owner && (
					<>
						{isLoading ? (
							<span className="loading loading-spinner loading-sm" />
						) : error ? (
							<p role="alert" className="text-error">
								{t("loadError")}
							</p>
						) : pending ? (
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
						) : (
							!debt.completed_at && (
								<form
									className="space-y-2"
									onSubmit={async (event) => {
										event.preventDefault();
										try {
											await invite(email);
											setEmail("");
											toast.success(t("sent"));
										} catch {
											toast.error(t("inviteError"));
										}
									}}
								>
									<label className="block text-sm" htmlFor="collaborator-email">
										{t("email")}
									</label>
									<div className="flex flex-col sm:flex-row gap-2">
										<input
											id="collaborator-email"
											type="email"
											required
											maxLength={254}
											className="input input-bordered flex-1 min-w-0"
											value={email}
											onChange={(event) => setEmail(event.target.value)}
											disabled={isSaving}
										/>
										<button className="btn btn-primary" disabled={isSaving}>
											{t("invite")}
										</button>
									</div>
									<p className="text-sm text-base-content/70">
										{t("inviteHelp")}
									</p>
								</form>
							)
						)}
					</>
				)
			)}
		</section>
	);
}
