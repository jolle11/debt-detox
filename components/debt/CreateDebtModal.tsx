"use client";

import { XIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	type HistoricalPaymentInfo,
	useCreateDebt,
} from "@/hooks/useCreateDebt";
import type { Debt } from "@/lib/types";
import ConfirmHistoricalPaymentsModal from "./ConfirmHistoricalPaymentsModal";
import CreateDebtForm from "./CreateDebtForm";

interface CreateDebtModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

export default function CreateDebtModal({
	isOpen,
	onClose,
	onSuccess,
}: CreateDebtModalProps) {
	const t = useTranslations();
	const { createDebt, isLoading, error } = useCreateDebt();
	const [historicalInfo, setHistoricalInfo] =
		useState<HistoricalPaymentInfo | null>(null);
	const [showHistoricalModal, setShowHistoricalModal] = useState(false);

	const handleSubmit = async (
		debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	) => {
		try {
			const result = await createDebt(debtData);
			if (result) {
				// Hay cuotas históricas, preguntar al usuario
				setHistoricalInfo(result);
				setShowHistoricalModal(true);
			} else {
				// No hay cuotas históricas, cerrar directamente
				onSuccess?.();
				onClose();
			}
		} catch (err) {
			// El error ya se maneja en el hook
		}
	};

	const handleHistoricalClose = () => {
		setShowHistoricalModal(false);
		setHistoricalInfo(null);
		onSuccess?.();
		onClose();
	};

	if (!isOpen && !showHistoricalModal) return null;

	return (
		<>
			{isOpen && !showHistoricalModal && (
				<div className="modal modal-open">
					<div className="modal-box w-11/12 max-w-4xl">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-bold">{t("debt.create.title")}</h3>
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

						<CreateDebtForm
							onSubmit={handleSubmit}
							onCancel={onClose}
							isSubmitting={isLoading}
						/>
					</div>
					<div className="modal-backdrop" onClick={onClose}></div>
				</div>
			)}

			<ConfirmHistoricalPaymentsModal
				info={historicalInfo}
				isOpen={showHistoricalModal}
				onClose={handleHistoricalClose}
			/>
		</>
	);
}
