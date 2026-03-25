"use client";

import {
	ChartBarIcon,
	CheckCircleIcon,
	ClockIcon,
	CreditCardIcon,
	TargetIcon,
} from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import {
	calculateDebtStatus,
	calculatePaymentProgress,
	calculateRemainingAmount,
	calculateTotalAmount,
} from "@/lib/format";
import type { Debt, Payment, SharedProfile } from "@/lib/types";

interface SharedProfileViewProps {
	debts: Debt[];
	payments: Payment[];
	share: SharedProfile;
	userName?: string;
}

function formatCurrencySimple(amount: number): string {
	return new Intl.NumberFormat("es-ES", {
		style: "currency",
		currency: "EUR",
		minimumFractionDigits: 2,
	}).format(amount);
}

export default function SharedProfileView({
	debts,
	payments,
	share,
	userName,
}: SharedProfileViewProps) {
	const [animatedProgress, setAnimatedProgress] = useState(0);

	const activeDebts = debts.filter(
		(d) => calculateDebtStatus(d.final_payment_date) === "active",
	);
	const completedDebts = debts.filter(
		(d) => calculateDebtStatus(d.final_payment_date) === "completed",
	);

	const totalDebt = activeDebts.reduce(
		(sum, debt) => sum + calculateRemainingAmount(debt),
		0,
	);
	const totalMonthlyPayment = activeDebts.reduce(
		(sum, debt) => sum + debt.monthly_amount,
		0,
	);
	const averageProgress =
		activeDebts.length > 0
			? Math.round(
					activeDebts.reduce(
						(sum, debt) => sum + calculatePaymentProgress(debt).percentage,
						0,
					) / activeDebts.length,
				)
			: 0;

	const totalOriginalDebt = activeDebts.reduce(
		(sum, debt) => sum + calculateTotalAmount(debt),
		0,
	);
	const totalPaid = totalOriginalDebt - totalDebt;

	useEffect(() => {
		const timer = setTimeout(() => {
			setAnimatedProgress(averageProgress);
		}, 100);
		return () => clearTimeout(timer);
	}, [averageProgress]);

	return (
		<div className="py-6 space-y-4">
			{/* Header */}
			<div className="text-center mb-6">
				<p className="text-sm text-base-content/50 mb-2">Debt Detox</p>
				<h1 className="text-2xl font-bold">
					{userName ? `${userName}` : "Resumen financiero"}
				</h1>
				<p className="text-base-content/70 mt-1">
					{activeDebts.length} financiación
					{activeDebts.length !== 1 ? "es" : ""} activa
					{activeDebts.length !== 1 ? "s" : ""}
					{share.show_completed && completedDebts.length > 0 && (
						<>
							{" "}
							· {completedDebts.length} completada
							{completedDebts.length !== 1 ? "s" : ""}
						</>
					)}
				</p>
			</div>

			{/* Average progress */}
			<div className="card bg-base-100 shadow-sm">
				<div className="card-body p-4">
					<h2 className="card-title text-lg mb-2">
						<TargetIcon className="w-5 h-5" />
						Progreso Global
					</h2>
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<div className="flex-1">
								<div className="w-full bg-base-300 rounded-full h-4">
									<div
										className="bg-primary h-4 rounded-full flex items-center justify-end pr-2 transition-all duration-700 ease-out"
										style={{
											width: `${animatedProgress > 0 ? Math.max(animatedProgress, 5) : 0}%`,
										}}
									>
										{animatedProgress > 15 && (
											<span className="text-sm font-medium text-primary-content">
												{animatedProgress}%
											</span>
										)}
									</div>
								</div>
							</div>
							{animatedProgress <= 15 && (
								<span className="text-lg font-semibold text-primary">
									{animatedProgress}%
								</span>
							)}
						</div>
						<div className="text-sm text-base-content/70 text-center">
							Progreso medio de todas las financiaciones activas
						</div>
					</div>
				</div>
			</div>

			{/* Summary stats */}
			{share.show_amounts && (
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							Deuda Pendiente
						</div>
						<div className="text-xl font-bold text-warning">
							{formatCurrencySimple(totalDebt)}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							Pago Mensual
						</div>
						<div className="text-xl font-bold text-secondary">
							{formatCurrencySimple(totalMonthlyPayment)}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							Total Pagado
						</div>
						<div className="text-xl font-bold text-success">
							{formatCurrencySimple(Math.max(0, totalPaid))}
						</div>
					</div>
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							Deuda Original
						</div>
						<div className="text-xl font-bold text-primary">
							{formatCurrencySimple(totalOriginalDebt)}
						</div>
					</div>
				</div>
			)}

			{/* Quick stats without amounts */}
			{!share.show_amounts && (
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-base-100 rounded-xl border border-base-300 p-4">
						<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
							Activas
						</div>
						<div className="text-2xl font-bold text-primary">
							{activeDebts.length}
						</div>
					</div>
					{share.show_completed && (
						<div className="bg-base-100 rounded-xl border border-base-300 p-4">
							<div className="text-sm font-medium text-base-content/60 uppercase tracking-wide mb-1">
								Completadas
							</div>
							<div className="text-2xl font-bold text-success">
								{completedDebts.length}
							</div>
						</div>
					)}
				</div>
			)}

			{/* Completed stats */}
			{share.show_completed &&
				share.show_amounts &&
				completedDebts.length > 0 && (
					<div className="card bg-success/10 border-2 border-success/30 shadow-sm">
						<div className="card-body p-4">
							<div className="flex items-center gap-2 mb-2">
								<CheckCircleIcon className="w-5 h-5 text-success" />
								<h2 className="font-bold text-lg text-success">
									{completedDebts.length} financiación
									{completedDebts.length !== 1 ? "es" : ""} completada
									{completedDebts.length !== 1 ? "s" : ""}
								</h2>
							</div>
							<div className="text-sm text-base-content/70">
								Total liquidado:{" "}
								{formatCurrencySimple(
									completedDebts.reduce(
										(sum, debt) => sum + calculateTotalAmount(debt),
										0,
									),
								)}
							</div>
						</div>
					</div>
				)}

			{/* Debt list */}
			{share.show_debt_list && activeDebts.length > 0 && (
				<div className="card bg-base-100 shadow-sm">
					<div className="card-body p-4">
						<h2 className="card-title text-lg mb-3">
							<CreditCardIcon className="w-5 h-5" />
							Financiaciones Activas
						</h2>
						<div className="space-y-3">
							{activeDebts.map((debt) => {
								const progress = calculatePaymentProgress(debt);
								return (
									<div
										key={debt.id}
										className="bg-base-200 rounded-xl border border-base-300 p-3"
									>
										<div className="flex justify-between items-start mb-2">
											<div>
												<div className="font-medium">{debt.name}</div>
												<div className="text-sm text-base-content/60">
													{debt.entity}
												</div>
											</div>
											{share.show_amounts && (
												<div className="text-right">
													<div className="text-sm font-bold text-warning">
														{formatCurrencySimple(
															calculateRemainingAmount(debt),
														)}
													</div>
													<div className="text-xs text-base-content/50">
														pendiente
													</div>
												</div>
											)}
										</div>
										<div className="flex items-center gap-3">
											<div className="flex-1">
												<div className="w-full bg-base-300 rounded-full h-2.5">
													<div
														className="bg-primary h-2.5 rounded-full transition-all duration-500"
														style={{
															width: `${Math.max(progress.percentage, 2)}%`,
														}}
													/>
												</div>
											</div>
											<span className="text-sm font-semibold text-primary min-w-[3rem] text-right">
												{progress.percentage}%
											</span>
										</div>
										{share.show_amounts && (
											<div className="flex justify-between text-xs text-base-content/50 mt-1">
												<span>
													{formatCurrencySimple(debt.monthly_amount)}/mes
												</span>
												<span>
													{progress.paidPayments}/{progress.totalPayments}{" "}
													cuotas
												</span>
											</div>
										)}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}

			{/* Completed debt list */}
			{share.show_debt_list &&
				share.show_completed &&
				completedDebts.length > 0 && (
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body p-4">
							<h2 className="card-title text-lg mb-3">
								<CheckCircleIcon className="w-5 h-5 text-success" />
								Completadas
							</h2>
							<div className="space-y-3">
								{completedDebts.map((debt) => (
									<div
										key={debt.id}
										className="bg-success/5 rounded-xl border border-success/20 p-3"
									>
										<div className="flex justify-between items-center">
											<div>
												<div className="font-medium">{debt.name}</div>
												<div className="text-sm text-base-content/60">
													{debt.entity}
												</div>
											</div>
											<div className="flex items-center gap-2">
												{share.show_amounts && (
													<span className="text-sm font-bold text-success">
														{formatCurrencySimple(calculateTotalAmount(debt))}
													</span>
												)}
												<CheckCircleIcon className="w-5 h-5 text-success" />
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				)}

			{/* Footer branding */}
			<div className="text-center pt-4">
				<p className="text-xs text-base-content/40">
					Compartido con Debt Detox
				</p>
			</div>
		</div>
	);
}
