"use client";

import {
	Check,
	Copy,
	LinkSimple,
	ShareNetwork,
	Trash,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { type ExpiresIn, useShareProfile } from "@/hooks/useShareProfile";
import { useToast } from "@/hooks/useToast";

interface ShareProfileModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function ShareProfileModal({
	isOpen,
	onClose,
}: ShareProfileModalProps) {
	const t = useTranslations();
	const toast = useToast();
	const {
		createShareLink,
		fetchActiveLinks,
		revokeLink,
		activeLinks,
		isLoading,
		isLoadingLinks,
	} = useShareProfile();

	const [expiresIn, setExpiresIn] = useState<ExpiresIn>("7d");
	const [showAmounts, setShowAmounts] = useState(false);
	const [showDebtList, setShowDebtList] = useState(true);
	const [showCompleted, setShowCompleted] = useState(true);
	const [generatedLink, setGeneratedLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (isOpen) {
			fetchActiveLinks();
			setGeneratedLink(null);
			setCopied(false);
		}
	}, [isOpen]);

	const handleGenerate = async () => {
		try {
			const link = await createShareLink({
				expiresIn,
				showAmounts,
				showDebtList,
				showCompleted,
			});
			setGeneratedLink(link);
			toast.success("linkGenerated");
			await fetchActiveLinks();
		} catch {
			toast.error("genericError");
		}
	};

	const handleCopy = async () => {
		if (!generatedLink) return;
		try {
			await navigator.clipboard.writeText(generatedLink);
			setCopied(true);
			toast.success("linkCopied");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("clipboardError");
		}
	};

	const handleRevoke = async (id: string) => {
		try {
			await revokeLink(id);
			toast.success("linkRevoked");
		} catch {
			toast.error("genericError");
		}
	};

	const formatExpiration = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString(undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	if (!isOpen) return null;

	return (
		<dialog className="modal modal-open">
			<div className="modal-box max-w-lg">
				<h3 className="font-bold text-lg flex items-center gap-2">
					<ShareNetwork className="w-5 h-5" />
					{t("shareProfile.title")}
				</h3>
				<p className="text-sm text-base-content/70 mt-1">
					{t("shareProfile.description")}
				</p>

				<div className="divider my-3"></div>

				{/* Privacy toggles */}
				<div className="space-y-3">
					<h4 className="font-medium text-sm uppercase tracking-wide text-base-content/60">
						{t("shareProfile.visibleFields")}
					</h4>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-sm">{t("shareProfile.fields.stats")}</span>
						<input
							type="checkbox"
							className="toggle toggle-sm toggle-primary"
							checked
							disabled
						/>
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-sm">{t("shareProfile.fields.progress")}</span>
						<input
							type="checkbox"
							className="toggle toggle-sm toggle-primary"
							checked
							disabled
						/>
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-sm">{t("shareProfile.fields.debtList")}</span>
						<input
							type="checkbox"
							className="toggle toggle-sm toggle-primary"
							checked={showDebtList}
							onChange={(e) => setShowDebtList(e.target.checked)}
						/>
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-sm">{t("shareProfile.fields.amounts")}</span>
						<input
							type="checkbox"
							className="toggle toggle-sm toggle-primary"
							checked={showAmounts}
							onChange={(e) => setShowAmounts(e.target.checked)}
						/>
					</label>

					<label className="flex items-center justify-between cursor-pointer">
						<span className="text-sm">
							{t("shareProfile.fields.completed")}
						</span>
						<input
							type="checkbox"
							className="toggle toggle-sm toggle-primary"
							checked={showCompleted}
							onChange={(e) => setShowCompleted(e.target.checked)}
						/>
					</label>
				</div>

				<div className="divider my-3"></div>

				{/* Expiration selector */}
				<div>
					<h4 className="font-medium text-sm uppercase tracking-wide text-base-content/60 mb-2">
						{t("share.expiration")}
					</h4>
					<div className="flex gap-2">
						{(["24h", "7d", "30d", "never"] as ExpiresIn[]).map((option) => (
							<button
								key={option}
								className={`btn btn-sm flex-1 ${expiresIn === option ? "btn-primary" : "btn-ghost border border-base-300"}`}
								onClick={() => setExpiresIn(option)}
							>
								{t(`share.expiresIn.${option}`)}
							</button>
						))}
					</div>
				</div>

				{/* Generate button */}
				<button
					className="btn btn-primary w-full mt-4"
					onClick={handleGenerate}
					disabled={isLoading}
				>
					{isLoading ? (
						<span className="loading loading-spinner loading-sm"></span>
					) : (
						<>
							<LinkSimple className="w-4 h-4" />
							{t("share.generate")}
						</>
					)}
				</button>

				{/* Generated link */}
				{generatedLink && (
					<div className="mt-4 bg-base-200 rounded-lg p-3">
						<div className="flex items-center gap-2">
							<input
								type="text"
								className="input input-sm input-bordered flex-1 font-mono text-xs"
								value={generatedLink}
								readOnly
							/>
							<button
								className={`btn btn-sm ${copied ? "btn-success" : "btn-ghost"}`}
								onClick={handleCopy}
							>
								{copied ? (
									<Check className="w-4 h-4" />
								) : (
									<Copy className="w-4 h-4" />
								)}
							</button>
						</div>
					</div>
				)}

				{/* Active links list */}
				{activeLinks.length > 0 && (
					<div className="mt-4">
						<h4 className="font-medium text-sm uppercase tracking-wide text-base-content/60 mb-2">
							{t("share.activeLinks")}
						</h4>
						<div className="space-y-2">
							{activeLinks.map((link) => (
								<div
									key={link.id}
									className="flex items-center justify-between bg-base-200 rounded-lg px-3 py-2 text-xs"
								>
									<div>
										<span className="font-mono">...{link.token.slice(-8)}</span>
										<span className="text-base-content/50 ml-2">
											{new Date(link.expires_at).getFullYear() >= 9999
												? t("share.neverExpires")
												: `${t("share.expiresAt")} ${formatExpiration(link.expires_at)}`}
										</span>
									</div>
									<button
										className="btn btn-ghost btn-xs text-error"
										onClick={() => handleRevoke(link.id!)}
										title={t("share.revoke")}
									>
										<Trash className="w-3.5 h-3.5" />
									</button>
								</div>
							))}
						</div>
					</div>
				)}

				{isLoadingLinks && (
					<div className="flex justify-center mt-4">
						<span className="loading loading-spinner loading-sm"></span>
					</div>
				)}

				{/* Close */}
				<div className="modal-action">
					<button className="btn btn-ghost" onClick={onClose}>
						{t("common.cancel")}
					</button>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button onClick={onClose}>close</button>
			</form>
		</dialog>
	);
}
