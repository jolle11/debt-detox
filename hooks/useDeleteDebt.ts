"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS } from "@/lib/types";

interface UseDeleteDebtReturn {
	deleteDebt: (debtId: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

export function useDeleteDebt(): UseDeleteDebtReturn {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async (debtId: string) => {
			if (!pb.authStore.isValid) {
				throw new Error("Usuario no autenticado");
			}

			// Soft delete: set the deleted field to current date
			const deletedDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.update(debtId, {
					deleted: new Date().toISOString(),
				});

			return deletedDebt;
		},
		onSuccess: () => {
			// Invalidar cache de debts para refetch automático
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		},
	});

	const deleteDebt = async (debtId: string): Promise<void> => {
		await mutation.mutateAsync(debtId);
	};

	return {
		deleteDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
	};
}
