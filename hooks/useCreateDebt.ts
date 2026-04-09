"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { parseDateOnly } from "@/lib/dateOnly";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

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

			const debtDataWithUser = {
				...debtData,
				user_id: user.id,
				original_monthly_amount: debtData.monthly_amount,
				original_number_of_payments: debtData.number_of_payments,
			};

			const createdDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.create(debtDataWithUser);

			// Calcular cuántas cuotas históricas hay (excluyendo el mes actual)
			const now = new Date();
			const startDate = parseDateOnly(debtData.first_payment_date);
			let historicalCount = 0;

			if (startDate && startDate < now) {
				for (let i = 0; i < debtData.number_of_payments; i++) {
					const paymentDate = new Date(startDate);
					paymentDate.setMonth(paymentDate.getMonth() + i);

					// Solo contar meses estrictamente anteriores al mes actual
					if (
						paymentDate.getFullYear() < now.getFullYear() ||
						(paymentDate.getFullYear() === now.getFullYear() &&
							paymentDate.getMonth() < now.getMonth())
					) {
						historicalCount++;
					} else {
						break;
					}
				}
			}

			return {
				debt: createdDebt,
				historicalInfo:
					historicalCount > 0
						? {
								debtId: createdDebt.id,
								count: historicalCount,
								monthlyAmount: debtData.monthly_amount,
								firstPaymentDate: debtData.first_payment_date,
								numberOfPayments: debtData.number_of_payments,
							}
						: null,
			};
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
