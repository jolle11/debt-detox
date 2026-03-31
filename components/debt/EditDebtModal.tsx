"use client";

import { XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEditDebt } from "@/hooks/useEditDebt";
import { useToast } from "@/hooks/useToast";
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
	const toast = useToast();
	const { editDebt, isLoading } = useEditDebt();

	const handleSubmit = async (
		debtData: Omit<Debt, "created" | "updated" | "deleted">,
	) => {
		if (!debt?.id) return;

		try {
			await editDebt(debt.id, debtData);
			toast.success("debtUpdated");
			onSuccess?.();
			onClose();
		} catch (err) {
			toast.error("genericError");
		}
	};

	if (!isOpen || !debt) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box w-11/12 max-w-4xl">
				<div className="flex justify-between items-center mb-4">
					<h3 className="text-lg font-bold">{t("debt.edit.title")}</h3>
					<button
						className="btn btn-sm btn-circle btn-ghost"
						onClick={onClose}
						disabled={isLoading}
					>
						<XIcon size={20} />
					</button>
				</div>

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
