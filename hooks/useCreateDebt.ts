"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";
import { usePayments } from "@/hooks/usePayments";

interface UseCreateDebtReturn {
	createDebt: (
		debtData: Omit<Debt, "id" | "created" | "updated" | "deleted">,
	) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

export function useCreateDebt(): UseCreateDebtReturn {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const { generateHistoricalPayments } = usePayments();

	const createDebt = async (
		debtData: Omit<Debt, "id" | "created" | "updated" | "deleted">,
	) => {
		setIsLoading(true);
		setError(null);
		setSuccess(false);

		try {
			if (!pb.authStore.isValid) {
				throw new Error("Usuario no autenticado");
			}

			const createdDebt = await pb.collection(COLLECTIONS.DEBTS).create(debtData);
			
			// Generar pagos históricos automáticamente si es una financiación a medias
			await generateHistoricalPayments(
				createdDebt.id,
				debtData.first_payment_date,
				debtData.monthly_amount,
				debtData.number_of_payments
			);
			
			setSuccess(true);
		} catch (err) {
			const errorMessage =
				err instanceof Error ? err.message : "Error desconocido";
			setError(errorMessage);
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	return {
		createDebt,
		isLoading,
		error,
		success,
	};
}
