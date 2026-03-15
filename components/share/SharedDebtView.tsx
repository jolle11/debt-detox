"use client";

import { useEffect, useState } from "react";
import { TargetIcon, CalendarIcon, CreditCardIcon, FileTextIcon, CheckCircle, XCircle, Calendar } from "@phosphor-icons/react";
import type { Debt, Payment, SharedDebt } from "@/lib/types";
import { calculatePaymentStats } from "@/utils/debtCalculations";
import {
	calculatePaymentProgressWithPayments,
	calculateTotalAmount,
} from "@/lib/format";

interface SharedDebtViewProps {
	debt: Debt;
	payments: Payment[];
	share: SharedDebt;
}

function formatCurrencySimple(amount: number): string {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
	}).format(amount);
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function formatMonthYear(month: number, year: number): string {
	const date = new Date(year, month - 1, 1);
	return date.toLocaleDateString("es-ES", {
		month: "long",
		year: "numeric",
	});
}

function formatShortDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("es-ES", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

function generateExpectedPayments(debt: Debt, payments: Payment[]) {
	const expectedPayments: Array<{
		month: number;
		year: number;
		planned_amount: number;
		payment: Payment | null;
		extraPayments: Payment[];
		isOverdue: boolean;
		totalActualAmount: number;
	}> = [];

	const startDate = new Date(debt.first_payment_date);
	const now = new Date();

	for (let i = 0; i < debt.number_of_payments; i++) {
		const paymentDate = new Date(startDate);
		paymentDate.setMonth(paymentDate.getMonth() + i);

		const month = paymentDate.getMonth() + 1;
		const year = paymentDate.getFullYear();

		const dueDate = new Date(paymentDate);
		dueDate.setDate(startDate.getDate());
		const isOverdue = dueDate < now;

		const actualPayment =
			payments.find(
				(p) =>
					p.month === month &&
					p.year === year &&
					p.debt_id === debt.id &&
					!p.is_extra_payment,
			) || null;

		const extraPaymentsForMonth = payments.filter(
			(p) =>
				p.month === month &&
				p.year === year &&
				p.debt_id === debt.id &&
				p.is_extra_payment &&
				p.paid,
		);

		const actualAmount = actualPayment?.paid
			? actualPayment.actual_amount || debt.monthly_amount
			: 0;

		expectedPayments.push({
			month,
			year,
			planned_amount: debt.monthly_amount,
			payment: actualPayment,
			extraPayments: extraPaymentsForMonth,
			isOverdue: isOverdue && (!actualPayment || !actualPayment.paid),
			totalActualAmount: actualAmount,
		});
	}

	return expectedPayments;
}

export default function SharedDebtView({
	debt,
	payments,
	share,
}: SharedDebtViewProps) {
	const [animatedPercentage, setAnimatedPercentage] = useState(0);

	const totalAmount = calculateTotalAmount(debt);
	const paymentStats = calculatePaymentStats(debt, payments);
	const progress = calculatePaymentProgressWithPayments(debt, payments);

	const validPercentage = Math.min(
		isNaN(progress.percentage) ? 0 : progress.percentage,
		100,
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimatedPercentage(validPercentage);
		}, 100);
		return () => clearTimeout(timer);
	}, [validPercentage]);

	return (
		<div className="py-6 space-y-4">
			{/* Header */}
			<div className="text-center mb-6">
				<p className="text-sm text-base-content/50 mb-2">Debt Detox</p>
				<h1 className="text-2xl font-bold">{debt.name}</h1>
				{share.show_entity && (
					<p className="text-base-content/70 mt-1">{debt.entity}</p>
				)}
			</div>

			{/* Remaining amount highlight */}
			{share.show_amounts && (
				<div className="card bg-warning/10 border-2 border-warning/30 shadow-sm">
					<div className="card-body p-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="text-sm font-medium text-warning uppercase tracking-wide mb-1">
									Pendiente de pago
								</div>
								<div className="text-3xl font-bold text-warning">
									{formatCurrencySimple(Math.max(0, paymentStats.pendingAmount))}
								</div>
								<div className="text-sm text-base-content/60 mt-1">
									{paymentStats.pendingPayments} cuota{paymentStats.pendingPayments !== 1 ? "s" : ""} restante{paymentStats.pendingPayments !== 1 ? "s" : ""}
								</div>
							</div>
							<div className="text-right">
								<div className="text-sm text-base-content/60 mb-1">de un total de</div>
								<div className="text-lg font-semibold text-base-content/80">
									{formatCurrencySimple(totalAmount)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Progress */}
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body p-4">
					<h2 className="card-title text-lg mb-2">
						<TargetIcon className="w-5 h-5" />
						Progreso
					</h2>

					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="w-full bg-base-300 rounded-full h-4">
									<div
										className="bg-primary h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
										style={{
											width: `${animatedPercentage > 0 ? Math.max(animatedPercentage, 5) : 0}%`,
										}}
									>
										{animatedPercentage > 15 && (
											<span className="text-sm font-medium text-primary-content">
												{Math.round(animatedPercentage)}%
											</span>
										)}
									</div>
								</div>
							</div>
							{animatedPercentage <= 15 && (
								<span className="text-lg font-semibold text-primary">
									{Math.round(animatedPercentage)}%
								</span>
							)}
						</div>

						<div className="flex justify-between items-center">
							<span className="text-lg font-medium">
								Cuotas: {progress.paidPayments}/{progress.totalPayments}
							</span>
							<span className="text-base text-base-content/70">
								{progress.totalPayments - progress.paidPayments} restantes
							</span>
						</div>
					</div>
				</div>
			</div>


			{/* Quick stats (conditional on amounts) */}
			{share.show_amounts && (
				<div className="grid grid-cols-3 gap-3">
					{[
						{
							label: "Pagado",
							value: formatCurrencySimple(paymentStats.effectivePaidAmount),
							color: "text-success",
						},
						{
							label: "Cuotas",
							value: `${paymentStats.effectivePaidPayments}/${debt.number_of_payments}`,
							color: "text-info",
						},
						{
							label: "Mensual",
							value: formatCurrencySimple(debt.monthly_amount),
							color: "text-secondary",
						},
					].map(({ label, value, color }) => (
						<div
							key={label}
							className="bg-base-100 rounded-xl border border-base-300 p-4"
						>
							<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
								{label}
							</div>
							<div className={`text-xl font-bold ${color}`}>
								{value}
							</div>
						</div>
					))}
				</div>
			)}

			{/* Payment details (conditional on amounts) */}
			{share.show_amounts && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CreditCardIcon className="w-5 h-5" />
							Detalles de Pago
						</h2>
						<div className="grid grid-cols-2 gap-3">
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									Cuotas Pagadas
								</div>
								<div className="text-2xl font-bold text-success">
									{paymentStats.effectivePaidPayments}
								</div>
								<div className="text-sm text-base-content/70">
									de {debt.number_of_payments}
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									Pendientes
								</div>
								<div className="text-2xl font-bold text-warning">
									{paymentStats.pendingPayments}
								</div>
								<div className="text-sm text-base-content/70">
									restantes
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									Importe Pagado
								</div>
								<div className="text-lg font-bold text-success">
									{formatCurrencySimple(paymentStats.effectivePaidAmount)}
								</div>
							</div>
							<div className="bg-base-200 rounded-xl border border-base-300 p-3">
								<div className="text-sm text-base-content/60 uppercase tracking-wide mb-1">
									Por Pagar
								</div>
								<div className="text-lg font-bold text-warning">
									{formatCurrencySimple(Math.max(0, paymentStats.pendingAmount))}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Structure (conditional on amounts) */}
			{share.show_amounts && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<FileTextIcon className="w-5 h-5" />
							Estructura
						</h2>
						<div className="space-y-3">
							{debt.down_payment != null && debt.down_payment > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-base-content/70">Entrada:</span>
									<span className="font-medium">
										{formatCurrencySimple(debt.down_payment)}
									</span>
								</div>
							)}
							<div className="flex justify-between items-center">
								<span className="text-base-content/70">Cuota mensual:</span>
								<span className="font-medium">
									{formatCurrencySimple(debt.monthly_amount)}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-base-content/70">Duración:</span>
								<span className="font-medium">
									{debt.number_of_payments} meses
								</span>
							</div>
							{debt.final_payment != null && debt.final_payment > 0 && (
								<div className="flex justify-between items-center">
									<span className="text-base-content/70">Cuota final:</span>
									<span className="font-medium">
										{formatCurrencySimple(debt.final_payment)}
									</span>
								</div>
							)}
							<div className="bg-base-300 rounded-lg p-3 mt-4">
								<div className="flex justify-between items-center">
									<span className="font-medium">Total:</span>
									<span className="font-bold text-xl">
										{formatCurrencySimple(totalAmount)}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Dates (conditional) */}
			{share.show_dates && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CalendarIcon className="w-5 h-5" />
							Fechas
						</h2>
						<div className="space-y-4">
							<div>
								<div className="text-sm text-base-content/70 mb-1">
									Primera Cuota
								</div>
								<div className="font-medium">
									{formatDate(debt.first_payment_date)}
								</div>
							</div>
							<div>
								<div className="text-sm text-base-content/70 mb-1">
									Última Cuota
								</div>
								<div className="font-medium">
									{debt.final_payment_date
										? formatDate(debt.final_payment_date)
										: "No especificada"}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Payments list */}
			<SharedPaymentsList
				debt={debt}
				payments={payments}
				showAmounts={share.show_amounts}
			/>

			{/* Footer branding */}
			<div className="text-center pt-4">
				<p className="text-xs text-base-content/40">
					Compartido con Debt Detox
				</p>
			</div>
		</div>
	);
}

function SharedPaymentsList({
	debt,
	payments,
	showAmounts,
}: {
	debt: Debt;
	payments: Payment[];
	showAmounts: boolean;
}) {
	const allExpectedPayments = generateExpectedPayments(debt, payments);
	const extraPayments = payments.filter((p) => p.is_extra_payment && p.paid);

	const totalPaidPayments = allExpectedPayments.filter(
		(ep) => ep.payment?.paid,
	).length;
	const totalOverduePayments = allExpectedPayments.filter(
		(ep) => ep.isOverdue,
	).length;
	const totalPendingPayments = debt.number_of_payments - totalPaidPayments;

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="card-title text-lg">
						<CreditCardIcon className="w-5 h-5" />
						Listado de Pagos
					</h2>
					<div className="text-sm text-base-content/70">
						{totalPaidPayments}/{debt.number_of_payments} pagos realizados
					</div>
				</div>

				{/* Summary stats */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="text-center p-2 bg-success/10 rounded-lg">
						<div className="text-lg font-bold text-success">
							{totalPaidPayments}
						</div>
						<div className="text-xs text-success/80">Pagados</div>
					</div>
					<div className="text-center p-2 bg-error/10 rounded-lg">
						<div className="text-lg font-bold text-error">
							{totalOverduePayments}
						</div>
						<div className="text-xs text-error/80">Vencidos</div>
					</div>
					<div className="text-center p-2 bg-warning/10 rounded-lg">
						<div className="text-lg font-bold text-warning">
							{totalPendingPayments}
						</div>
						<div className="text-xs text-warning/80">Pendientes</div>
					</div>
				</div>

				{/* Extra payments section */}
				{extraPayments.length > 0 && (
					<div className="mb-4">
						<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
							<span className="badge badge-primary badge-sm">
								{extraPayments.length}
							</span>
							Pagos Personalizados
						</h3>
						{showAmounts && (
							<div className="text-sm font-medium text-base-content/70 px-2 mb-2">
								Total pagos extras:{" "}
								{formatCurrencySimple(
									extraPayments.reduce(
										(sum, p) => sum + (p.actual_amount || 0),
										0,
									),
								)}
							</div>
						)}
						<div className="grid grid-cols-1 gap-2">
							{extraPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20"
								>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-primary" />
										<span className="text-sm">
											{payment.paid_date
												? formatShortDate(payment.paid_date)
												: formatMonthYear(payment.month, payment.year)}
										</span>
									</div>
									{showAmounts && (
										<span className="font-mono text-sm font-semibold text-primary">
											{formatCurrencySimple(payment.actual_amount || 0)}
										</span>
									)}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Payments table */}
				<div className="overflow-x-auto">
					<table className="table table-sm">
						<thead>
							<tr>
								<th>Período</th>
								<th>Estado</th>
								{showAmounts && (
									<>
										<th className="text-right">Importe Planeado</th>
										<th className="text-right">Importe Real</th>
									</>
								)}
								<th>Fecha de Pago</th>
							</tr>
						</thead>
						<tbody>
							{allExpectedPayments.map((ep) => {
								const isPaid = ep.payment?.paid || false;
								const hasExtraPayments = ep.extraPayments.length > 0;

								return (
									<tr
										key={`${ep.year}-${ep.month}`}
										className={
											isPaid
												? "bg-success/5"
												: ep.isOverdue
													? "bg-error/5"
													: ""
										}
									>
										<td>
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4 text-base-content/50" />
												<span className="font-medium">
													{formatMonthYear(ep.month, ep.year)}
												</span>
											</div>
										</td>
										<td>
											<div className="flex items-center gap-2">
												{isPaid ? (
													<>
														<CheckCircle className="w-4 h-4 text-success" />
														<span className="badge badge-success badge-sm">
															Pagado
														</span>
													</>
												) : ep.isOverdue ? (
													<>
														<XCircle className="w-4 h-4 text-error" />
														<span className="badge badge-error badge-sm">
															Vencido
														</span>
													</>
												) : (
													<>
														<Calendar className="w-4 h-4 text-warning" />
														<span className="badge badge-warning badge-sm">
															Pendiente
														</span>
													</>
												)}
											</div>
										</td>
										{showAmounts && (
											<>
												<td className="text-right font-mono text-sm">
													{formatCurrencySimple(ep.planned_amount)}
												</td>
												<td className="text-right font-mono text-sm">
													{isPaid ? (
														<span
															className={
																ep.totalActualAmount !== ep.planned_amount
																	? "text-warning font-medium"
																	: ""
															}
														>
															{formatCurrencySimple(ep.totalActualAmount)}
														</span>
													) : hasExtraPayments ? (
														<span className="text-xs text-primary">
															(+ {ep.extraPayments.length} pago
															{ep.extraPayments.length > 1 ? "s" : ""} extra
															{ep.extraPayments.length > 1 ? "s" : ""})
														</span>
													) : (
														<span className="text-base-content/40">-</span>
													)}
												</td>
											</>
										)}
										<td className="text-sm text-base-content/70">
											{ep.payment?.paid_date ? (
												formatShortDate(ep.payment.paid_date)
											) : (
												<span className="text-base-content/40">-</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
						{showAmounts && (
							<tfoot>
								<tr className="font-medium border-t-2">
									<td colSpan={2}>Total</td>
									<td className="text-right font-mono">
										{formatCurrencySimple(
											debt.monthly_amount * debt.number_of_payments,
										)}
									</td>
									<td className="text-right font-mono">
										{formatCurrencySimple(
											Math.min(
												allExpectedPayments.reduce(
													(sum, ep) => sum + ep.totalActualAmount,
													0,
												) +
													extraPayments.reduce(
														(sum, p) => sum + (p.actual_amount || 0),
														0,
													),
												(debt.down_payment || 0) +
													debt.monthly_amount * debt.number_of_payments +
													(debt.final_payment || 0),
											),
										)}
									</td>
									<td></td>
								</tr>
							</tfoot>
						)}
					</table>
				</div>
			</div>
		</div>
	);
}
