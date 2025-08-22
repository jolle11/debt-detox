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
import DebtPaymentsList from "@/components/dashboard/debt-payments-list";
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

		// Calcular meses transcurridos basado en fechas exactas
		let monthsElapsed = 0;
		const currentDate = new Date(
			now.getFullYear(),
			now.getMonth(),
			now.getDate(),
		);
		const startDate = new Date(
			firstPayment.getFullYear(),
			firstPayment.getMonth(),
			firstPayment.getDate(),
		);

		// Calcular diferencia en meses
		const yearsDiff = currentDate.getFullYear() - startDate.getFullYear();
		const monthsDiff = currentDate.getMonth() - startDate.getMonth();

		monthsElapsed = yearsDiff * 12 + monthsDiff;

		// Si la fecha actual es anterior al día del primer pago del mes, no contar ese mes
		if (currentDate.getDate() < startDate.getDate()) {
			monthsElapsed--;
		}

		// Asegurar que no sea negativo y no exceda el total
		monthsElapsed = Math.max(0, monthsElapsed + 1);

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
		<div className="container mx-auto px-4 py-6">
			{/* Compact Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<button
						onClick={() => router.back()}
						className="btn btn-ghost btn-sm"
					>
						<ArrowLeftIcon className="w-4 h-4" />
						Volver
					</button>
					<div>
						<h1 className="text-xl font-bold">{debt.name}</h1>
						<p className="text-sm text-base-content/70">
							{debt.entity}
						</p>
					</div>
				</div>
				<div
					className={`badge ${status === "completed" ? "badge-success" : status === "active" ? "badge-primary" : "badge-warning"}`}
				>
					{status === "completed"
						? "Completado"
						: status === "active"
							? "Activo"
							: "Pendiente"}
				</div>
			</div>

			{/* Quick Stats Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						Total
					</div>
					<div className="text-xl font-bold text-primary">
						{formatCurrency(totalAmount)}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						Pagado
					</div>
					<div className="text-xl font-bold text-success">
						{formatCurrency(paymentStats.effectivePaidAmount)}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						Cuotas
					</div>
					<div className="text-xl font-bold text-info">
						{paymentStats.effectivePaidPayments}/
						{debt.number_of_payments}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						Mensual
					</div>
					<div className="text-xl font-bold text-secondary">
						{formatCurrency(debt.monthly_amount)}
					</div>
				</div>
			</div>

			{/* Main Content - More compact grid */}
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
				{/* Main Content - Reorganized into 4 columns */}
				<div className="xl:col-span-3 space-y-4">
					{/* Progress Section */}
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body p-4">
							<h2 className="card-title text-lg mb-2">
								<TargetIcon className="w-5 h-5" />
								Progreso y Pagos
							</h2>
							<DebtProgressWithPayments debt={debt} />
							<div className="mt-3">
								<DebtPaymentStatus debt={debt} />
							</div>
						</div>
					</div>

					{/* Combined Details Section */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{/* Payment Details */}
						<div className="card bg-base-100 shadow">
							<div className="card-body p-5">
								<h2 className="card-title text-xl mb-4">
									<CreditCardIcon className="w-6 h-6" />
									Detalles de Pago
								</h2>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											Cuotas Pagadas
										</div>
										<div className="text-2xl font-bold text-success">
											{paymentStats.effectivePaidPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											de {debt.number_of_payments}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											Pendientes
										</div>
										<div className="text-2xl font-bold text-warning">
											{paymentStats.pendingPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											restantes
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											Importe Pagado
										</div>
										<div className="text-lg font-bold text-success">
											{formatCurrency(
												paymentStats.effectivePaidAmount,
											)}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											Por Pagar
										</div>
										<div className="text-lg font-bold text-warning">
											{formatCurrency(
												Math.max(
													0,
													paymentStats.pendingAmount,
												),
											)}
										</div>
									</div>
								</div>
							</div>
						</div>

						{/* Structure Details */}
						<div className="card bg-base-100 shadow">
							<div className="card-body p-5">
								<h2 className="card-title text-xl mb-4">
									<FileTextIcon className="w-6 h-6" />
									Estructura
								</h2>
								<div className="space-y-4">
									{debt.down_payment !== undefined &&
										debt.down_payment !== null && (
											<div className="flex justify-between items-center">
												<span className="text-base text-base-content/70">
													Entrada:
												</span>
												<span className="font-medium text-lg">
													{debt.down_payment > 0
														? formatCurrency(
																debt.down_payment,
															)
														: "No aplica"}
												</span>
											</div>
										)}
									<div className="flex justify-between items-center">
										<span className="text-base text-base-content/70">
											Cuota mensual:
										</span>
										<span className="font-medium text-lg">
											{formatCurrency(
												debt.monthly_amount,
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-base text-base-content/70">
											Duración:
										</span>
										<span className="font-medium text-lg">
											{debt.number_of_payments} meses
										</span>
									</div>
									{debt.final_payment !== undefined &&
										debt.final_payment !== null && (
											<div className="flex justify-between items-center">
												<span className="text-base text-base-content/70">
													Cuota final:
												</span>
												<span className="font-medium text-lg">
													{debt.final_payment > 0
														? formatCurrency(
																debt.final_payment,
															)
														: "No aplica"}
												</span>
											</div>
										)}
									<div className="bg-base-300 rounded-lg p-4 mt-6">
										<div className="flex justify-between items-center">
											<span className="text-base font-medium">
												Total:
											</span>
											<span className="font-bold text-2xl">
												{formatCurrency(totalAmount)}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Payments List */}
					<DebtPaymentsList
						debt={debt}
						payments={payments}
						isLoading={paymentsLoading}
					/>

					{/* Product Image - Only show if exists, more compact */}
					{debt.product_image && (
						<div className="card bg-base-100 shadow-sm">
							<div className="card-body p-4">
								<h2 className="card-title text-lg mb-2">
									<FileTextIcon className="w-5 h-5" />
									Producto
								</h2>
								<img
									src={debt.product_image}
									alt={debt.name}
									className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
								/>
							</div>
						</div>
					)}
				</div>

				{/* Sidebar - Dates and Additional Info */}
				<div className="space-y-6">
					{/* Dates */}
					<div className="card bg-base-100 shadow">
						<div className="card-body p-5">
							<h2 className="card-title text-xl mb-4">
								<CalendarIcon className="w-6 h-6" />
								Fechas
							</h2>
							<div className="space-y-5">
								<div>
									<div className="text-base text-base-content/70 mb-2">
										Primera Cuota
									</div>
									<div className="text-lg font-medium">
										{formatDate(debt.first_payment_date)}
									</div>
								</div>
								<div>
									<div className="text-base text-base-content/70 mb-2">
										Última Cuota
									</div>
									<div className="text-lg font-medium">
										{formatDate(debt.final_payment_date)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
