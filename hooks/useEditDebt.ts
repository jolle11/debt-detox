"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import type { Debt } from "@/lib/types";

interface UseEditDebtReturn {
	editDebt: (
		debtId: string,
		debtData: Omit<Debt, "created" | "updated" | "deleted">,
	) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

export function useEditDebt(): UseEditDebtReturn {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const mutation = useMutation({
		mutationFn: async ({
			debtId,
			debtData,
		}: {
			debtId: string;
			debtData: Omit<Debt, "created" | "updated" | "deleted">;
		}) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}

			return pb.send<{ debt: Debt }>(`/api/debt-detox/debts/${debtId}`, {
				method: "PATCH",
				body: debtData,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["debts"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});

	const editDebt = async (
		debtId: string,
		debtData: Omit<Debt, "created" | "updated" | "deleted">,
	): Promise<void> => {
		await mutation.mutateAsync({ debtId, debtData });
	};

	return {
		editDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}
