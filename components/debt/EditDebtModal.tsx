"use client";

import { XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEditDebt } from "@/hooks/useEditDebt";
import type { Debt } from "@/lib/types";
import EditDebtForm from "./EditDebtForm";

interface EditDebtModalProps {
	debt: Debt | null;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function EditDebtModal({
	debt,
	isOpen,
	onClose,
	onSuccess,
}: EditDebtModalProps) {
	const t = useTranslations();
	const { editDebt, isLoading, error } = useEditDebt();

	const handleSubmit = async (
		debtData: Omit<Debt, "created" | "updated" | "deleted">,
	) => {
		if (!debt?.id) return;

		try {
			await editDebt(debt.id, debtData);
			onSuccess?.();
			onClose();
		} catch (err) {
			// El error ya se maneja en el hook
		}
	};

	if (!isOpen || !debt) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box w-11/12 max-w-4xl">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold">
						{t("debt.edit.title")}
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

				<EditDebtForm
					debt={debt}
					onSubmit={handleSubmit}
					onCancel={onClose}
					isSubmitting={isLoading}
				/>
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</div>
	);
}
