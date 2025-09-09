"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Payment } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

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
	) => Promise<void>;
	markMultiplePaymentsAsPaid: (
		debtId: string,
		paymentData: Array<{
			month: number;
			year: number;
			plannedAmount: number;
			actualAmount?: number;
		}>,
	) => Promise<void>;
	getPaymentStatus: (
		debtId: string,
		month: number,
		year: number,
	) => Payment | null;
	generateHistoricalPayments: (
		debtId: string,
		firstPaymentDate: string,
		monthlyAmount: number,
		numberOfPayments: number,
	) => Promise<void>;
}

const fetchPayments = async (debtId?: string): Promise<Payment[]> => {
	if (!pb.authStore.isValid) {
		return [];
	}

	try {
		const filter = debtId
			? `debt_id = "${debtId}" && deleted = null`
			: "deleted = null";

		const records = await pb
			.collection(COLLECTIONS.PAYMENTS)
			.getFullList({
				filter,
				sort: "-year,-month",
			});

		return records as unknown as Payment[];
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
		queryFn: () => fetchPayments(debtId),
		enabled: !!user, // Solo ejecuta si hay usuario autenticado
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	const markPaymentMutation = useMutation({
		mutationFn: async ({
			debtId,
			month,
			year,
			plannedAmount,
			actualAmount,
		}: {
			debtId: string;
			month: number;
			year: number;
			plannedAmount: number;
			actualAmount?: number;
		}) => {
			// Buscar si ya existe un payment para este mes/año
			const existingPayments = await pb
				.collection(COLLECTIONS.PAYMENTS)
				.getFullList({
					filter: `debt_id = "${debtId}" && month = ${month} && year = ${year} && deleted = null`,
				});

			const amountToPay = actualAmount || plannedAmount;

			if (existingPayments.length > 0) {
				// Actualizar el payment existente
				const payment = existingPayments[0];
				return await pb.collection(COLLECTIONS.PAYMENTS).update(payment.id, {
					paid: true,
					paid_date: new Date().toISOString(),
					actual_amount: amountToPay,
				});
			} else {
				// Crear un nuevo payment
				return await pb.collection(COLLECTIONS.PAYMENTS).create({
					debt_id: debtId,
					month,
					year,
					planned_amount: plannedAmount,
					actual_amount: amountToPay,
					paid: true,
					paid_date: new Date().toISOString(),
				});
			}
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
	): Promise<void> => {
		await markPaymentMutation.mutateAsync({
			debtId,
			month,
			year,
			plannedAmount,
			actualAmount,
		});
	};

	const markMultiplePaymentsAsPaid = async (
		debtId: string,
		paymentData: Array<{
			month: number;
			year: number;
			plannedAmount: number;
			actualAmount?: number;
		}>,
	) => {
		try {
			// Procesar cada pago
			for (const payment of paymentData) {
				await markPaymentAsPaid(
					debtId,
					payment.month,
					payment.year,
					payment.plannedAmount,
					payment.actualAmount,
				);
			}
		} catch (err) {
			console.error("Error marking multiple payments as paid:", err);
			throw err;
		}
	};

	const getPaymentStatus = (
		debtId: string,
		month: number,
		year: number,
	): Payment | null => {
		return (
			payments.find(
				(p) =>
					p.debt_id === debtId &&
					p.month === month &&
					p.year === year,
			) || null
		);
	};

	const generateHistoricalPayments = async (
		debtId: string,
		firstPaymentDate: string,
		monthlyAmount: number,
		numberOfPayments: number,
	) => {
		try {
			const now = new Date();
			const startDate = new Date(firstPaymentDate);

			// Solo generar pagos históricos si la primera cuota es anterior a hoy
			if (startDate >= now) {
				return; // Es una financiación nueva, no generar pagos históricos
			}

			const historicalPayments = [];

			for (let i = 0; i < numberOfPayments; i++) {
				const paymentDate = new Date(startDate);
				paymentDate.setMonth(paymentDate.getMonth() + i);

				// Solo generar pagos para fechas anteriores a hoy
				if (paymentDate < now) {
					const year = paymentDate.getFullYear();
					const month = paymentDate.getMonth() + 1;

					// Verificar si ya existe un pago para este mes/año
					const existingPayments = await pb
						.collection(COLLECTIONS.PAYMENTS)
						.getFullList({
							filter: `debt_id = "${debtId}" && month = ${month} && year = ${year} && deleted = null`,
						});

					if (existingPayments.length === 0) {
						// Crear pago histórico automático (marcado como pagado)
						historicalPayments.push({
							debt_id: debtId,
							month,
							year,
							planned_amount: monthlyAmount,
							actual_amount: monthlyAmount,
							paid: true,
							paid_date: new Date(
								paymentDate.getFullYear(),
								paymentDate.getMonth(),
								1,
							).toISOString(),
						});
					}
				} else {
					// Llegamos a fechas futuras, parar
					break;
				}
			}

			// Crear todos los pagos históricos en batch
			for (const payment of historicalPayments) {
				await pb.collection(COLLECTIONS.PAYMENTS).create(payment);
			}

			// Invalidar cache para refetch automático
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		} catch (err) {
			console.error("Error generating historical payments:", err);
			throw err;
		}
	};

	return {
		payments,
		isLoading,
		error: error?.message || null,
		refetch,
		markPaymentAsPaid,
		markMultiplePaymentsAsPaid,
		getPaymentStatus,
		generateHistoricalPayments,
	};
}
