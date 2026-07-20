"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import {
	COLLECTIONS,
	type Debt,
	type ExtraPaymentStrategy,
	type Payment,
} from "@/lib/types";

interface UsePaymentsReturn {
	payments: Payment[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
	markPaymentAsPaid: (
		debtId: string,
		month: number,
		year: number,
		plannedAmount: number,
		actualAmount?: number,
		paidDate?: string,
	) => Promise<void>;
	confirmHistoricalPayments: (debtId: string) => Promise<void>;
	unmarkPaymentAsPaid: (paymentId: string) => Promise<void>;
	updatePaymentAmount: (paymentId: string, amount: number) => Promise<void>;
	deleteExtraPayment: (paymentId: string) => Promise<void>;
	addExtraPayment: (
		debtId: string,
		amount: number,
		strategy?: ExtraPaymentStrategy,
		debt?: Debt,
		currentPayments?: Payment[],
	) => Promise<void>;
	getPaymentStatus: (
		debtId: string,
		month: number,
		year: number,
	) => Payment | null;
}

export type MarkPaymentAsPaidFn = UsePaymentsReturn["markPaymentAsPaid"];

const PAYMENT_DEBT_FILTER_BATCH_SIZE = 20;

const getAuthorizedDebtIds = async (
	userId: string,
	debtId?: string,
): Promise<string[]> => {
	const filter = debtId
		? pb.filter("deleted = null && user_id = {:userId} && id = {:debtId}", {
				userId,
				debtId,
			})
		: pb.filter("deleted = null && user_id = {:userId}", { userId });

	const debts = await pb.collection(COLLECTIONS.DEBTS).getFullList({
		filter,
		sort: "-created",
	});

	return debts.map((debt) => debt.id);
};

const buildPaymentsFilter = (debtIds: string[]): string => {
	const debtConditions = debtIds
		.map((_, index) => `debt_id = {:debtId${index}}`)
		.join(" || ");
	const params = Object.fromEntries(
		debtIds.map((id, index) => [`debtId${index}`, id]),
	);

	return pb.filter(`deleted = null && (${debtConditions})`, params);
};

const sortPaymentsByDateDesc = (payments: Payment[]): Payment[] =>
	payments.sort((left, right) => {
		if (left.year !== right.year) {
			return right.year - left.year;
		}

		return right.month - left.month;
	});

const fetchPayments = async (
	userId: string,
	debtId?: string,
): Promise<Payment[]> => {
	if (!pb.authStore.isValid || !userId) {
		return [];
	}

	try {
		const authorizedDebtIds = await getAuthorizedDebtIds(userId, debtId);

		if (authorizedDebtIds.length === 0) {
			return [];
		}

		const paymentBatches: Payment[] = [];

		for (
			let index = 0;
			index < authorizedDebtIds.length;
			index += PAYMENT_DEBT_FILTER_BATCH_SIZE
		) {
			const debtIdsBatch = authorizedDebtIds.slice(
				index,
				index + PAYMENT_DEBT_FILTER_BATCH_SIZE,
			);
			const records = (await pb.collection(COLLECTIONS.PAYMENTS).getFullList({
				filter: buildPaymentsFilter(debtIdsBatch),
				sort: "-year,-month",
			})) as unknown as Payment[];

			paymentBatches.push(...records);
		}

		return sortPaymentsByDateDesc(paymentBatches);
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : "Error al cargar los pagos";
		console.error("Error fetching payments:", err);
		throw new Error(errorMessage);
	}
};

export function usePayments(debtId?: string): UsePaymentsReturn {
	const queryClient = useQueryClient();
	const { user } = useAuth();

	const {
		data: payments = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["payments", debtId, user?.id], // Include user ID in query key
		queryFn: () => fetchPayments(user?.id || "", debtId),
		enabled: !!user?.id, // Solo ejecuta si hay usuario autenticado
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	const markPaymentMutation = useMutation({
		mutationFn: async ({
			debtId,
			month,
			year,
			plannedAmount: _plannedAmount,
			actualAmount,
			paidDate,
		}: {
			debtId: string;
			month: number;
			year: number;
			plannedAmount: number;
			actualAmount?: number;
			paidDate?: string;
		}) => {
			if (!user?.id) {
				throw new Error("Usuario no autenticado");
			}

			return pb.send<{ payment: Payment }>(
				`/api/debt-detox/debts/${debtId}/payments/${year}/${month}`,
				{
					method: "PUT",
					body: {
						actual_amount: actualAmount,
						paid_date: paidDate,
					},
				},
			);
		},
		onSuccess: () => {
			// Invalidar cache de payments para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			// También invalidar debts ya que los pagos afectan el progreso
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		},
	});

	const markPaymentAsPaid = async (
		debtId: string,
		month: number,
		year: number,
		plannedAmount: number,
		actualAmount?: number,
		paidDate?: string,
	): Promise<void> => {
		await markPaymentMutation.mutateAsync({
			debtId,
			month,
			year,
			plannedAmount,
			actualAmount,
			paidDate,
		});
	};

	const confirmHistoricalPayments = async (debtId: string) => {
		await pb.send(`/api/debt-detox/debts/${debtId}/historical-payments`, {
			method: "POST",
		});
		queryClient.invalidateQueries({ queryKey: ["payments"] });
		queryClient.invalidateQueries({ queryKey: ["debts"] });
	};

	const getPaymentStatus = (
		debtId: string,
		month: number,
		year: number,
	): Payment | null => {
		return (
			payments.find(
				(p) => p.debt_id === debtId && p.month === month && p.year === year,
			) || null
		);
	};

	const addExtraPayment = async (
		debtId: string,
		amount: number,
		strategy: ExtraPaymentStrategy = "none",
		_debt?: Debt,
		_currentPayments?: Payment[],
	): Promise<void> => {
		try {
			await pb.send(`/api/debt-detox/debts/${debtId}/extra-payment`, {
				method: "POST",
				body: { amount, strategy },
			});

			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		} catch (err) {
			console.error("Error adding extra payment:", err);
			throw err;
		}
	};

	const unmarkPaymentAsPaid = async (paymentId: string): Promise<void> => {
		try {
			await pb.send(`/api/debt-detox/payments/${paymentId}/unmark`, {
				method: "POST",
			});

			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		} catch (err) {
			console.error("Error unmarking payment as paid:", err);
			throw err;
		}
	};

	const updatePaymentAmount = async (
		paymentId: string,
		amount: number,
	): Promise<void> => {
		try {
			await pb.send(`/api/debt-detox/payments/${paymentId}/amount`, {
				method: "PATCH",
				body: { amount },
			});

			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		} catch (err) {
			console.error("Error updating payment amount:", err);
			throw err;
		}
	};

	const deleteExtraPayment = async (paymentId: string): Promise<void> => {
		try {
			await pb.send(`/api/debt-detox/payments/${paymentId}/extra`, {
				method: "DELETE",
			});

			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["debts"] });
		} catch (err) {
			console.error("Error deleting extra payment:", err);
			throw err;
		}
	};

	return {
		payments,
		isLoading,
		error: error?.message || null,
		refetch,
		markPaymentAsPaid,
		confirmHistoricalPayments,
		unmarkPaymentAsPaid,
		updatePaymentAmount,
		deleteExtraPayment,
		addExtraPayment,
		getPaymentStatus,
	};
}
