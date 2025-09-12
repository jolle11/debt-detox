"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePayments } from "@/hooks/usePayments";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

interface UseCreateDebtReturn {
	createDebt: (
		debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	) => Promise<void>;
	isLoading: boolean;
	error: string | null;
	success: boolean;
}

export function useCreateDebt(): UseCreateDebtReturn {
	const queryClient = useQueryClient();
	const { generateHistoricalPayments } = usePayments();
	const { user } = useAuth();

	const mutation = useMutation({
		mutationFn: async (
			debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
		) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}

			const debtDataWithUser = {
				...debtData,
				user_id: user.id,
			};

			const createdDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.create(debtDataWithUser);

			// Generar pagos históricos automáticamente si es una financiación a medias
			await generateHistoricalPayments(
				createdDebt.id,
				debtData.first_payment_date,
				debtData.monthly_amount,
				debtData.number_of_payments,
			);

			return createdDebt;
		},
		onSuccess: () => {
			// Invalidar cache de debts para refetch automático
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		},
	});

	const createDebt = async (
		debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	): Promise<void> => {
		await mutation.mutateAsync(debtData);
	};

	return {
		createDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}
