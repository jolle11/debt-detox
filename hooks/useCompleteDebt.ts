"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import type { Debt, Payment } from "@/lib/types";

interface UseCompleteDebtReturn {
	completeDebt: (debt: Debt, payments?: Payment[]) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

export function useCompleteDebt(): UseCompleteDebtReturn {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const mutation = useMutation({
		mutationFn: async (debt: Debt) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}
			if (!debt.id) {
				throw new Error("Deuda inválida");
			}

			return pb.send<{ debt: Debt }>(
				`/api/debt-detox/debts/${debt.id}/complete`,
				{ method: "POST" },
			);
		},
		onSuccess: () => {
			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["debts"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});

	const completeDebt = async (
		debt: Debt,
		_payments: Payment[] = [],
	): Promise<void> => {
		await mutation.mutateAsync(debt);
	};

	return {
		completeDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}
