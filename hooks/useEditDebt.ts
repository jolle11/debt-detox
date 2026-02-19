"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
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

			// Verify the debt belongs to the current user before updating
			const existingDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.getOne(debtId, { filter: pb.filter("user_id = {:userId}", { userId: user.id }) });

			if (!existingDebt) {
				throw new Error("No tienes permisos para editar esta deuda");
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
