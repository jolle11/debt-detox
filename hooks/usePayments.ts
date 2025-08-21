"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Payment } from "@/lib/types";

interface UsePaymentsReturn {
	payments: Payment[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
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

export function usePayments(debtId?: string): UsePaymentsReturn {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPayments = async () => {
		setIsLoading(true);
		setError(null);

		try {
			if (!pb.authStore.isValid) {
				setPayments([]);
				return;
			}

			const filter = debtId
				? `debt_id = "${debtId}" && deleted = null`
				: "deleted = null";

			const records = await pb
				.collection(COLLECTIONS.PAYMENTS)
				.getFullList({
					filter,
					sort: "-year,-month",
				});

			setPayments(records as Payment[]);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al cargar los pagos";
			setError(errorMessage);
			console.error("Error fetching payments:", err);
		} finally {
			setIsLoading(false);
		}
	};

	const markPaymentAsPaid = async (
		debtId: string,
		month: number,
		year: number,
		plannedAmount: number,
		actualAmount?: number,
	) => {
		try {
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
				await pb.collection(COLLECTIONS.PAYMENTS).update(payment.id, {
					paid: true,
					paid_date: new Date().toISOString(),
					actual_amount: amountToPay,
				});
			} else {
				// Crear un nuevo payment
				await pb.collection(COLLECTIONS.PAYMENTS).create({
					debt_id: debtId,
					month,
					year,
					planned_amount: plannedAmount,
					actual_amount: amountToPay,
					paid: true,
					paid_date: new Date().toISOString(),
				});
			}

			// Refrescar la lista
			await fetchPayments();
		} catch (err) {
			console.error("Error marking payment as paid:", err);
			throw err;
		}
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

			// Refrescar la lista
			await fetchPayments();
		} catch (err) {
			console.error("Error generating historical payments:", err);
			throw err;
		}
	};

	useEffect(() => {
		fetchPayments();
	}, [debtId]);

	return {
		payments,
		isLoading,
		error,
		refetch: fetchPayments,
		markPaymentAsPaid,
		markMultiplePaymentsAsPaid,
		getPaymentStatus,
		generateHistoricalPayments,
	};
}
