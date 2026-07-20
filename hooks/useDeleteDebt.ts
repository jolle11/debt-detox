"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";

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

			return pb.send<{ deleted: boolean; deletedAt: string }>(
				`/api/debt-detox/debts/${debtId}`,
				{ method: "DELETE" },
			);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["debts"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
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
