"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { COLLECTIONS } from "@/lib/types";

interface UseDeleteDebtReturn {
	deleteDebt: (debtId: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

export function useDeleteDebt(): UseDeleteDebtReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const deleteDebt = async (debtId: string) => {
		setIsLoading(true);
		setError(null);

		try {
			if (!pb.authStore.isValid) {
				throw new Error("Usuario no autenticado");
			}

			// Soft delete: set the deleted field to current date
			await pb.collection(COLLECTIONS.DEBTS).update(debtId, {
				deleted: new Date().toISOString(),
			});
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al eliminar la financiación";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		deleteDebt,
		isLoading,
		error,
	};
}
