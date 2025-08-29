"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt, type Payment } from "@/lib/types";

interface DebtPaymentStatusProps {
	debt: Debt;
	payments: Payment[];
}

export default function DebtPaymentStatus({ debt, payments }: DebtPaymentStatusProps) {
	const queryClient = useQueryClient();
	const [isProcessing, setIsProcessing] = useState(false);
	const t = useTranslations("paymentStatus");

	const currentDate = new Date();
	const currentMonth = currentDate.getMonth() + 1; // getMonth() returns 0-11
	const currentYear = currentDate.getFullYear();

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

	const currentPaymentStatus = getPaymentStatus(
		debt.id!,
		currentMonth,
		currentYear,
	);
	const isCurrentMonthPaid = currentPaymentStatus?.paid || false;

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

	const handleMarkAsPaid = async (e: React.MouseEvent) => {
		e.stopPropagation();
		if (isProcessing || !debt.id) return;

		setIsProcessing(true);
		try {
			await markPaymentMutation.mutateAsync({
				debtId: debt.id,
				month: currentMonth,
				year: currentYear,
				plannedAmount: debt.monthly_amount,
				actualAmount: debt.monthly_amount,
			});
		} catch (error) {
			console.error("Error al marcar pago:", error);
			// Aquí podrías mostrar un toast de error
		} finally {
			setIsProcessing(false);
		}
	};

	// Verificar si la deuda ya está completada
	const debtEndDate = debt.final_payment_date ? new Date(debt.final_payment_date) : null;
	const isDebtCompleted = debtEndDate && currentDate > debtEndDate;

	if (isDebtCompleted) {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-success badge-lg">{t("completed")}</div>
			</div>
		);
	}

	// Verificar si aún no ha llegado la fecha del primer pago
	const firstPaymentDate = new Date(debt.first_payment_date);
	if (currentDate < firstPaymentDate) {
		return (
			<div className="flex items-center gap-3">
				<div className="badge badge-neutral badge-lg">
					{t("pendingStart")}
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			{isCurrentMonthPaid ? (
				<div className="badge badge-success badge-lg">
					{t("monthlyPaid")}
				</div>
			) : (
				<button
					onClick={handleMarkAsPaid}
					disabled={isProcessing}
					className="btn btn-primary"
				>
					{isProcessing ? (
						<span className="loading loading-spinner loading-sm"></span>
					) : (
						t("markAsPaid")
					)}
				</button>
			)}
		</div>
	);
}
