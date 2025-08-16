"use client";

import { useState } from "react";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

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

			await pb.collection(COLLECTIONS.DEBTS).create(debtData);
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
