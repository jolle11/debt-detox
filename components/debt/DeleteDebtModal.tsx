"use client";

import { TrashIcon, XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useDeleteDebt } from "@/hooks/useDeleteDebt";
import type { Debt } from "@/lib/types";

interface DeleteDebtModalProps {
	debt: Debt | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function DeleteDebtModal({
	debt,
	isOpen,
	onClose,
	onSuccess,
}: DeleteDebtModalProps) {
	const t = useTranslations();
	const { deleteDebt, isLoading, error } = useDeleteDebt();

	const handleDelete = async () => {
		if (!debt?.id) return;

		try {
			await deleteDebt(debt.id);
			onSuccess?.();
			onClose();
		} catch (err) {
			// El error ya se maneja en el hook
		}
	};

	if (!isOpen || !debt) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold">
						{t("debt.delete.title")}
					</h3>
					<button
						className="btn btn-sm btn-circle btn-ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						<XIcon size={20} />
					</button>
				</div>

				{error && (
					<div className="alert alert-error mb-4">
						<span>{error}</span>
					</div>
				)}

				<div className="flex flex-col items-center gap-4 py-4">
					<div className="p-4 bg-error/10 rounded-full">
						<TrashIcon size={48} className="text-error" />
					</div>

					<div className="text-center">
						<p className="text-lg font-semibold mb-2">
							{t("debt.delete.confirmation")}
						</p>
						<p className="text-base-content/70">
							{t("debt.delete.description", { name: debt.name })}
						</p>
						<p className="text-sm text-base-content/50 mt-2">
							{t("debt.delete.warning")}
						</p>
					</div>
				</div>

				<div className="modal-action">
					<button
						className="btn btn-ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						{t("debt.delete.cancel")}
					</button>
					<button
						className="btn btn-error"
						onClick={handleDelete}
						disabled={isLoading}
					>
						{isLoading && (
							<span className="loading loading-spinner loading-sm"></span>
						)}
						{t("debt.delete.confirm")}
					</button>
				</div>
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</div>
	);
}
