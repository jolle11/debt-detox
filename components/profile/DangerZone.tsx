"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import pb from "@/lib/pocketbase";

interface DangerZoneProps {
	user: RecordModel;
}

export default function DangerZone({ user }: DangerZoneProps) {
	const t = useTranslations("profile");
	const { logout } = useAuth();
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [confirmation, setConfirmation] = useState("");
	const [deleting, setDeleting] = useState(false);

	const close = () => {
		setOpen(false);
		setConfirmation("");
	};

	const deleteAccount = async () => {
		setDeleting(true);
		try {
			await pb.collection(user.collectionName || "users").delete(user.id);
			logout();
			router.push("/");
		} catch (error) {
			toast.error(
				(error instanceof Error && error.message) || t("deleteAccountError"),
			);
			setDeleting(false);
		}
	};

	return (
		<section
			aria-labelledby="profile-danger"
			className="card border border-error/40 bg-error/5"
		>
			<div className="card-body flex-row flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
				<div className="min-w-0">
					<h2 id="profile-danger" className="text-sm font-medium text-error">
						{t("deleteAccount")}
					</h2>
					<p className="mt-0.5 text-xs text-base-content/60">
						{t("deleteAccountDescription")}
					</p>
				</div>
				<button
					type="button"
					className="btn btn-outline btn-error btn-sm"
					onClick={() => setOpen(true)}
				>
					{t("delete")}
				</button>
			</div>
			{open && (
				<dialog
					className="modal modal-open"
					aria-labelledby="delete-account-title"
				>
					<div className="modal-box">
						<h3 id="delete-account-title" className="text-lg font-bold">
							{t("deleteAccountConfirmTitle")}
						</h3>
						<p className="py-3 text-sm text-base-content/70">
							{t("deleteAccountConfirmText", { email: user.email })}
						</p>
						<input
							type="email"
							aria-label={t("email")}
							className="input input-bordered w-full"
							value={confirmation}
							placeholder={user.email}
							autoComplete="off"
							onChange={(e) => setConfirmation(e.target.value)}
						/>
						<div className="modal-action">
							<button type="button" className="btn btn-ghost" onClick={close}>
								{t("cancel")}
							</button>
							<button
								type="button"
								className="btn btn-error"
								disabled={
									deleting ||
									confirmation.trim().toLowerCase() !==
										String(user.email).toLowerCase()
								}
								onClick={deleteAccount}
							>
								{deleting && (
									<span className="loading loading-spinner loading-xs" />
								)}
								{t("deleteAccount")}
							</button>
						</div>
					</div>
					<button
						type="button"
						className="modal-backdrop"
						aria-label={t("cancel")}
						onClick={close}
					/>
				</dialog>
			)}
		</section>
	);
}
