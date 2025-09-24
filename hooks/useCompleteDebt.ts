"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt, type Payment } from "@/lib/types";
import { calculateRemainingAmountWithPayments } from "@/lib/format";

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
		mutationFn: async ({
			debt,
			payments = [],
		}: {
			debt: Debt;
			payments: Payment[];
		}) => {
			if (!pb.authStore.isValid || !user?.id) {
				throw new Error("Usuario no autenticado");
			}

			// Verify the debt belongs to the current user
			const existingDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.getOne(debt.id!, { filter: `user_id = "${user.id}"` });

			if (!existingDebt) {
				throw new Error("No tienes permisos para completar esta deuda");
			}

			const today = new Date().toISOString().split('T')[0];
			const now = new Date();

			// Mark all existing unpaid payments as paid
			const unpaidPayments = payments.filter(p => !p.paid);
			for (const payment of unpaidPayments) {
				await pb.collection(COLLECTIONS.PAYMENTS).update(payment.id!, {
					paid: true,
					actual_amount: payment.planned_amount,
					paid_date: today,
				});
			}

			// Generate all missing monthly payments from the debt structure
			const startDate = new Date(debt.first_payment_date);
			const allPaymentPeriods = [];

			// Generate all expected monthly payment periods
			for (let i = 0; i < debt.number_of_payments; i++) {
				const paymentDate = new Date(startDate);
				paymentDate.setMonth(paymentDate.getMonth() + i);

				allPaymentPeriods.push({
					month: paymentDate.getMonth() + 1,
					year: paymentDate.getFullYear(),
					amount: debt.monthly_amount,
				});
			}

			// Add final payment if it exists
			if (debt.final_payment && debt.final_payment > 0) {
				const finalPaymentDate = debt.final_payment_date
					? new Date(debt.final_payment_date)
					: new Date(startDate.getFullYear(), startDate.getMonth() + debt.number_of_payments, startDate.getDate());

				allPaymentPeriods.push({
					month: finalPaymentDate.getMonth() + 1,
					year: finalPaymentDate.getFullYear(),
					amount: debt.final_payment,
				});
			}

			// Create payments for periods that don't exist yet
			for (const period of allPaymentPeriods) {
				const existingPayment = payments.find(p =>
					p.month === period.month && p.year === period.year
				);

				if (!existingPayment) {
					await pb.collection(COLLECTIONS.PAYMENTS).create({
						debt_id: debt.id,
						month: period.month,
						year: period.year,
						planned_amount: period.amount,
						actual_amount: period.amount,
						paid: true,
						paid_date: today,
					});
				}
			}

			// Update debt to mark as completed with today's date as final payment date
			const updatedDebt = await pb
				.collection(COLLECTIONS.DEBTS)
				.update(debt.id!, {
					...debt,
					final_payment_date: today,
				});

			return updatedDebt;
		},
		onSuccess: () => {
			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["debts"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});

	const completeDebt = async (debt: Debt, payments: Payment[] = []): Promise<void> => {
		await mutation.mutateAsync({ debt, payments });
	};

	return {
		completeDebt,
		isLoading: mutation.isPending,
		error: mutation.error?.message || null,
		success: mutation.isSuccess,
	};
}