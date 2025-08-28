"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

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

	const mutation = useMutation({
		mutationFn: async ({
			debtId,
			debtData,
		}: {
			debtId: string;
			debtData: Omit<Debt, "created" | "updated" | "deleted">;
		}) => {
			if (!pb.authStore.isValid) {
				throw new Error("Usuario no autenticado");
			}

			const updatedDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.update(debtId, debtData);

			return updatedDebt;
		},
		onSuccess: () => {
			// Invalidar cache de debts para refetch automático
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		},
	});

	const editDebt = async (
		debtId: string,
		debtData: Omit<Debt, "created" | "updated" | "deleted">,
	) => {
		return mutation.mutateAsync({ debtId, debtData });
	};

	return {
		editDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}
