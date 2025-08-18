"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
	ArrowLeftIcon,
	CalendarIcon,
	CreditCardIcon,
	CurrencyDollarIcon,
	FileTextIcon,
	BuildingsIcon,
	CalendarCheckIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { calculateDebtStatus, formatCurrency } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import DebtProgressWithPayments from "@/components/dashboard/debt-progress-with-payments";
import DebtPaymentStatus from "@/components/dashboard/debt-payment-status";
import { usePayments } from "@/hooks/usePayments";

export default function DebtDetailPage() {
	const params = useParams();
	const router = useRouter();
	const { debts } = useDebtsContext();
	const [debt, setDebt] = useState<Debt | null>(null);
	const { payments, isLoading: paymentsLoading } = usePayments(debt?.id);

	useEffect(() => {
		const debtId = params.id as string;
		const foundDebt = debts.find((d) => d.id === debtId);
		setDebt(foundDebt || null);
	}, [params.id, debts]);

	if (!debt) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">
							Financiación no encontrada
						</h2>
						<p className="text-base-content/70 mb-4">
							No se pudo encontrar la financiación solicitada.
						</p>
						<button
							onClick={() => router.back()}
							className="btn btn-primary"
						>
							Volver
						</button>
					</div>
				</div>
			</div>
		);
	}

	const status = calculateDebtStatus(debt.final_payment_date);
	const totalAmount =
		(debt.down_payment || 0) +
		debt.monthly_amount * debt.number_of_payments +
		(debt.final_payment || 0);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Calcular cuotas que deberían estar pagadas según fechas
	const calculateExpectedPaidPayments = () => {
		const now = new Date();
		const firstPayment = new Date(debt.first_payment_date);

		if (now < firstPayment) {
			return 0; // Aún no ha empezado
		}

		// Calcular meses transcurridos desde la primera cuota
		const monthsElapsed =
			Math.max(
				0,
				Math.floor(
					(now.getTime() - firstPayment.getTime()) /
						(30.44 * 24 * 60 * 60 * 1000),
				),
			) + 1; // +1 porque el primer mes cuenta

		return Math.min(monthsElapsed, debt.number_of_payments);
	};

	// Calcular estadísticas reales de pagos
	const calculatePaymentStats = () => {
		const registeredPaidPayments = payments.filter((p) => p.paid).length;
		const expectedPaidPayments = calculateExpectedPaidPayments();
		const totalRegisteredAmount = payments
			.filter((p) => p.paid)
			.reduce((sum, p) => sum + (p.actual_amount || p.planned_amount), 0);

		// Usar el máximo entre pagos registrados y estimados por fecha
		const effectivePaidPayments = Math.max(
			registeredPaidPayments,
			expectedPaidPayments,
		);

		// Calcular monto estimado total pagado
		const estimatedPaidAmount =
			(debt.down_payment || 0) +
			Math.max(registeredPaidPayments, expectedPaidPayments) *
				debt.monthly_amount;

		// Usar monto registrado si es mayor, sino usar estimado
		const effectivePaidAmount = Math.max(
			(debt.down_payment || 0) + totalRegisteredAmount,
			estimatedPaidAmount,
		);

		return {
			registeredPaidPayments,
			expectedPaidPayments,
			effectivePaidPayments,
			effectivePaidAmount,
			totalRegisteredAmount,
			pendingPayments: debt.number_of_payments - effectivePaidPayments,
			pendingAmount: totalAmount - effectivePaidAmount,
		};
	};

	const paymentStats = calculatePaymentStats();

	return (
		<div className="container mx-auto px-4 py-8">
			{/* Header */}
			<div className="flex items-center gap-4 mb-6">
				<button
					onClick={() => router.back()}
					className="btn btn-ghost btn-sm"
				>
					<ArrowLeftIcon className="w-4 h-4" />
					Volver
				</button>
				<div>
					<h1 className="text-2xl font-bold">{debt.name}</h1>
					<p className="text-base-content/70">{debt.entity}</p>
				</div>
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Left Column - Main Info */}
				<div className="lg:col-span-2 space-y-6">
					{/* Product Image */}
					{debt.product_image && (
						<div className="card bg-base-100 shadow-lg">
							<div className="card-body">
								<h2 className="card-title">
									<FileTextIcon className="w-5 h-5" />
									Imagen del Producto
								</h2>
								<div className="mt-4">
									<img
										src={debt.product_image}
										alt={debt.name}
										className="w-full max-w-md mx-auto rounded-lg shadow-md"
									/>
								</div>
							</div>
						</div>
					)}

					{/* Payment Progress */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<TargetIcon className="w-5 h-5" />
								Progreso de Pagos
							</h2>
							<div className="mt-4">
								<DebtProgressWithPayments debt={debt} />
								<div className="mt-4">
									<DebtPaymentStatus debt={debt} />
								</div>
							</div>
						</div>
					</div>

					{/* Payment Summary */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<CreditCardIcon className="w-5 h-5" />
								Resumen de Pagos
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								<div className="stat">
									<div className="stat-title">
										Cuotas Pagadas
									</div>
									<div className="stat-value text-lg text-success">
										{paymentStats.effectivePaidPayments}
									</div>
									<div className="stat-desc">
										de {debt.number_of_payments} cuotas
										{paymentStats.registeredPaidPayments !==
											paymentStats.expectedPaidPayments && (
											<span className="text-xs block">
												(
												{
													paymentStats.registeredPaidPayments
												}{" "}
												registradas +{" "}
												{paymentStats.expectedPaidPayments -
													paymentStats.registeredPaidPayments}{" "}
												estimadas)
											</span>
										)}
									</div>
								</div>
								<div className="stat">
									<div className="stat-title">
										Importe Pagado
									</div>
									<div className="stat-value text-lg text-success">
										{formatCurrency(
											paymentStats.effectivePaidAmount,
										)}
									</div>
									<div className="stat-desc">
										de {formatCurrency(totalAmount)}
										{paymentStats.totalRegisteredAmount >
											0 && (
											<span className="text-xs block">
												(
												{formatCurrency(
													(debt.down_payment || 0) +
														paymentStats.totalRegisteredAmount,
												)}{" "}
												registrado)
											</span>
										)}
									</div>
								</div>
								<div className="stat">
									<div className="stat-title">
										Cuotas Pendientes
									</div>
									<div className="stat-value text-lg text-warning">
										{paymentStats.pendingPayments}
									</div>
									<div className="stat-desc">
										cuotas restantes
									</div>
								</div>
								<div className="stat">
									<div className="stat-title">
										Importe Pendiente
									</div>
									<div className="stat-value text-lg text-warning">
										{formatCurrency(
											Math.max(
												0,
												paymentStats.pendingAmount,
											),
										)}
									</div>
									<div className="stat-desc">por pagar</div>
								</div>
							</div>
						</div>
					</div>

					{/* Payment Structure */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<FileTextIcon className="w-5 h-5" />
								Estructura de la Financiación
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
								{debt.down_payment && (
									<div className="stat">
										<div className="stat-title">
											Entrada
										</div>
										<div className="stat-value text-lg">
											{formatCurrency(debt.down_payment)}
										</div>
										<div className="stat-desc">
											pagada al inicio
										</div>
									</div>
								)}
								<div className="stat">
									<div className="stat-title">
										Cuota Mensual
									</div>
									<div className="stat-value text-lg">
										{formatCurrency(debt.monthly_amount)}
									</div>
									<div className="stat-desc">
										durante {debt.number_of_payments} meses
									</div>
								</div>
								{debt.final_payment && (
									<div className="stat">
										<div className="stat-title">
											Cuota Final
										</div>
										<div className="stat-value text-lg">
											{formatCurrency(debt.final_payment)}
										</div>
										<div className="stat-desc">
											al finalizar
										</div>
									</div>
								)}
								<div className="stat">
									<div className="stat-title">
										Total Financiado
									</div>
									<div className="stat-value text-lg">
										{formatCurrency(totalAmount)}
									</div>
									<div className="stat-desc">
										importe completo
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right Column - Summary */}
				<div className="space-y-6">
					{/* Financial Summary */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<CurrencyDollarIcon className="w-5 h-5" />
								Resumen Financiero
							</h2>
							<div className="space-y-4 mt-4">
								<div className="stat">
									<div className="stat-title">
										Importe Total
									</div>
									<div className="stat-value text-xl">
										{formatCurrency(totalAmount)}
									</div>
								</div>
								<div
									className={`badge ${status === "completed" ? "badge-success" : status === "active" ? "badge-primary" : "badge-warning"} badge-lg`}
								>
									{status === "completed"
										? "Completado"
										: status === "active"
											? "Activo"
											: "Pendiente"}
								</div>
							</div>
						</div>
					</div>

					{/* Dates */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<CalendarIcon className="w-5 h-5" />
								Fechas Importantes
							</h2>
							<div className="space-y-3 mt-4">
								<div className="flex items-center gap-3">
									<CalendarCheckIcon className="w-4 h-4 text-primary" />
									<div>
										<div className="text-sm text-base-content/70">
											Primera Cuota
										</div>
										<div className="font-medium">
											{formatDate(
												debt.first_payment_date,
											)}
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<CalendarCheckIcon className="w-4 h-4 text-primary" />
									<div>
										<div className="text-sm text-base-content/70">
											Última Cuota
										</div>
										<div className="font-medium">
											{formatDate(
												debt.final_payment_date,
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Entity Info */}
					<div className="card bg-base-100 shadow-lg">
						<div className="card-body">
							<h2 className="card-title">
								<BuildingsIcon className="w-5 h-5" />
								Entidad
							</h2>
							<div className="mt-4">
								<p className="text-lg font-medium">
									{debt.entity}
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
