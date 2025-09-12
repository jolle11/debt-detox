"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import { COLLECTIONS } from "@/lib/types";

interface UseDeleteDebtReturn {
	deleteDebt: (debtId: string) => Promise<void>;
	isLoading: boolean;
	error: string | null;
}

export function useDeleteDebt(): UseDeleteDebtReturn {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const mutation = useMutation({
		mutationFn: async (debtId: string) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}

			// Verify the debt belongs to the current user before deleting
			const existingDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.getOne(debtId, { filter: `user_id = "${user.id}"` });

			if (!existingDebt) {
				throw new Error("No tienes permisos para eliminar esta deuda");
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
