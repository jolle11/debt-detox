"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import type { Debt } from "@/lib/types";

export interface HistoricalPaymentInfo {
	debtId: string;
	count: number;
	monthlyAmount: number;
	firstPaymentDate: string;
	numberOfPayments: number;
}

interface UseCreateDebtReturn {
	createDebt: (
		debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	) => Promise<HistoricalPaymentInfo | null>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

export function useCreateDebt(): UseCreateDebtReturn {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const mutation = useMutation({
		mutationFn: async (
			debtData: Omit<
				Debt,
				"id" | "user_id" | "created" | "updated" | "deleted"
			>,
		) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}

			return pb.send<{
				debt: Debt;
				historicalInfo: HistoricalPaymentInfo | null;
			}>("/api/debt-detox/debts", {
				method: "POST",
				body: debtData,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		},
	});

	const createDebt = async (
		debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	): Promise<HistoricalPaymentInfo | null> => {
		const result = await mutation.mutateAsync(debtData);
		return result.historicalInfo;
	};

	return {
		createDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}
