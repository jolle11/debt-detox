"use client";

import {
	ArrowCounterClockwise,
	Calendar,
	CheckCircle,
	CreditCard,
	PencilSimple,
	Trash,
	WarningCircle,
	XCircle,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import SkeletonPaymentsList from "@/components/ui/skeletons/SkeletonPaymentsList";
import { useCurrency } from "@/hooks/useCurrency";
import { usePayments } from "@/hooks/usePayments";
import { parseDateOnly } from "@/lib/dateOnly";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import { calculateDebtStatus } from "@/lib/format";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt, type Payment } from "@/lib/types";

interface DebtPaymentsListProps {
	debt: Debt;
	payments: Payment[];
	isLoading?: boolean;
}

export default function DebtPaymentsList({
	debt,
	payments,
	isLoading,
}: DebtPaymentsListProps) {
	const t = useTranslations("paymentsList");
	const locale = useLocale();
	const queryClient = useQueryClient();
	const { formatCurrency } = useCurrency();
	const {
		unmarkPaymentAsPaid,
		updatePaymentAmount,
		deleteExtraPayment,
		markPaymentAsPaid,
	} = usePayments(debt.id);
	const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
	const [editAmount, setEditAmount] = useState<string>("");
	const [pendingUnmarkId, setPendingUnmarkId] = useState<string | null>(null);
	const [isReactivating, setIsReactivating] = useState(false);
	const tDebt = useTranslations("debt");
	// Generate all expected payments based on debt structure
	const generateAllExpectedPayments = () => {
		const expectedPayments: Array<{
			month: number;
			year: number;
			planned_amount: number;
			payment: Payment | null;
			extraPayments: Payment[];
			isOverdue: boolean;
			totalActualAmount: number;
		}> = [];

		const startDate = parseDateOnly(debt.first_payment_date);
		const now = new Date();
		if (!startDate) return expectedPayments;

		for (let i = 0; i < debt.number_of_payments; i++) {
			const paymentDate = new Date(startDate);
			paymentDate.setMonth(paymentDate.getMonth() + i);

			const month = paymentDate.getMonth() + 1;
			const year = paymentDate.getFullYear();

			// Determine if this payment is overdue (past due date and not paid)
			// A payment is overdue only after its due date has passed (not on the same day)
			const dueDate = new Date(paymentDate);
			dueDate.setDate(startDate.getDate());
			const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			const dueDateOnly = new Date(
				dueDate.getFullYear(),
				dueDate.getMonth(),
				dueDate.getDate(),
			);
			const isOverdue = dueDateOnly < today;

			// Find actual payment record (cuota mensual)
			const actualPayment =
				payments.find(
					(p) =>
						p.month === month &&
						p.year === year &&
						p.debt_id === debt.id &&
						!p.is_extra_payment,
				) || null;

			// Find extra payments for this month/year
			const extraPaymentsForMonth = payments.filter(
				(p) =>
					p.month === month &&
					p.year === year &&
					p.debt_id === debt.id &&
					p.is_extra_payment &&
					p.paid,
			);

			// Calculate actual amount ONLY from the monthly payment (cuota)
			// Extra payments are shown separately and don't affect this
			const actualAmount = actualPayment?.paid
				? actualPayment.actual_amount || debt.monthly_amount
				: 0;

			expectedPayments.push({
				month,
				year,
				planned_amount: actualPayment
					? actualPayment.planned_amount || debt.monthly_amount
					: debt.monthly_amount,
				payment: actualPayment,
				extraPayments: extraPaymentsForMonth,
				isOverdue: isOverdue && (!actualPayment || !actualPayment.paid),
				totalActualAmount: actualAmount,
			});
		}

		return expectedPayments;
	};

	const formatMonthYear = (month: number, year: number) => {
		const date = new Date(year, month - 1, 1);
		return date.toLocaleDateString(locale, {
			month: "long",
			year: "numeric",
		});
	};

	const formatPaymentDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString(locale, {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const handleUnmarkPayment = async (paymentId: string) => {
		// Si la deuda está completada, pedir confirmación primero
		const isCompleted =
			calculateDebtStatus(debt.final_payment_date) === "completed";
		if (isCompleted) {
			setPendingUnmarkId(paymentId);
			return;
		}
		try {
			await unmarkPaymentAsPaid(paymentId);
		} catch (error) {
			console.error("Error unmarking payment:", error);
		}
	};

	const handleConfirmReactivate = async () => {
		if (!pendingUnmarkId) return;
		setIsReactivating(true);
		try {
			// Desmarcar el pago
			await unmarkPaymentAsPaid(pendingUnmarkId);

			// Recalcular final_payment_date basándose en la estructura original
			const origPayments =
				debt.original_number_of_payments || debt.number_of_payments;

			await pb.collection(COLLECTIONS.DEBTS).update(debt.id!, {
				final_payment_date: resolveFinalPaymentDate({
					first_payment_date: debt.first_payment_date,
					number_of_payments: origPayments,
					final_payment: debt.final_payment,
				}),
			});

			// Invalidar caches para refetch
			queryClient.invalidateQueries({ queryKey: ["debts"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		} catch (error) {
			console.error("Error reactivating debt:", error);
		} finally {
			setIsReactivating(false);
			setPendingUnmarkId(null);
		}
	};

	const handleMarkAsPaid = async (
		month: number,
		year: number,
		plannedAmount: number,
	) => {
		try {
			await markPaymentAsPaid(debt.id!, month, year, plannedAmount);
		} catch (error) {
			console.error("Error marking payment as paid:", error);
		}
	};

	const handleDeleteExtraPayment = async (paymentId: string) => {
		try {
			await deleteExtraPayment(paymentId);
		} catch (error) {
			console.error("Error deleting extra payment:", error);
		}
	};

	const handleStartEdit = (paymentId: string, currentAmount: number) => {
		setEditingPaymentId(paymentId);
		setEditAmount(currentAmount.toString());
	};

	const handleCancelEdit = () => {
		setEditingPaymentId(null);
		setEditAmount("");
	};

	const handleSaveEdit = async (paymentId: string) => {
		try {
			const amount = parseFloat(editAmount);
			if (!isNaN(amount) && amount > 0) {
				await updatePaymentAmount(paymentId, amount);
				setEditingPaymentId(null);
				setEditAmount("");
			}
		} catch (error) {
			console.error("Error updating payment amount:", error);
		}
	};

	const allExpectedPayments = generateAllExpectedPayments();
	const extraPayments = payments.filter((p) => p.is_extra_payment && p.paid);
	const totalPaidPayments = allExpectedPayments.filter(
		(ep) => ep.payment?.paid,
	).length;
	const totalOverduePayments = allExpectedPayments.filter(
		(ep) => ep.isOverdue,
	).length;
	const totalPendingPayments = debt.number_of_payments - totalPaidPayments;

	if (isLoading) {
		return <SkeletonPaymentsList />;
	}

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<div className="flex items-center justify-between mb-4">
					<h2 className="card-title text-lg">
						<CreditCard className="w-5 h-5" />
						{t("title")}
					</h2>
					<div className="text-sm text-base-content/70">
						{totalPaidPayments}/{debt.number_of_payments}{" "}
						{t("paymentsCompleted")}
					</div>
				</div>

				{/* Summary stats */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="text-center p-2 bg-success/10 rounded-lg">
						<div className="text-lg font-bold text-success">
							{totalPaidPayments}
						</div>
						<div className="text-xs text-success/80">{t("statsPaid")}</div>
					</div>
					<div className="text-center p-2 bg-error/10 rounded-lg">
						<div className="text-lg font-bold text-error">
							{totalOverduePayments}
						</div>
						<div className="text-xs text-error/80">{t("statsOverdue")}</div>
					</div>
					<div className="text-center p-2 bg-warning/10 rounded-lg">
						<div className="text-lg font-bold text-warning">
							{totalPendingPayments}
						</div>
						<div className="text-xs text-warning/80">{t("statsPending")}</div>
					</div>
				</div>

				{/* Extra payments section - show all, not grouped by month */}
				{extraPayments.length > 0 && (
					<div className="mb-4">
						<h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
							<span className="badge badge-primary badge-sm">
								{extraPayments.length}
							</span>
							{t("extraPaymentsTitle")}
						</h3>
						<div className="grid grid-cols-1 gap-2">
							<div className="text-sm font-medium text-base-content/70 px-2">
								{t("extraPaymentsTotalLabel")}:{" "}
								{formatCurrency(
									extraPayments.reduce(
										(sum, p) => sum + (p.actual_amount || 0),
										0,
									),
								)}
							</div>
							{extraPayments.map((payment) => (
								<div
									key={payment.id}
									className="flex items-center justify-between p-2 bg-primary/5 rounded-lg border border-primary/20"
								>
									<div className="flex items-center gap-2">
										<CheckCircle className="w-4 h-4 text-primary" />
										<span className="text-sm">
											{formatPaymentDate(payment.paid_date!)}
										</span>
									</div>
									<div className="flex items-center gap-2">
										{editingPaymentId === payment.id ? (
											<>
												<input
													type="number"
													value={editAmount}
													onChange={(e) => setEditAmount(e.target.value)}
													className="input input-xs input-bordered w-24 font-mono"
													step="0.01"
												/>
												<button
													onClick={() => handleSaveEdit(payment.id!)}
													className="btn btn-xs btn-success"
												>
													<CheckCircle className="w-3 h-3" />
												</button>
												<button
													onClick={handleCancelEdit}
													className="btn btn-xs btn-ghost"
												>
													<XCircle className="w-3 h-3" />
												</button>
											</>
										) : (
											<>
												<span className="font-mono text-sm font-semibold text-primary">
													{formatCurrency(payment.actual_amount || 0)}
												</span>
												<button
													onClick={() =>
														handleStartEdit(
															payment.id!,
															payment.actual_amount || 0,
														)
													}
													className="btn btn-xs btn-ghost"
													title="Edit amount"
												>
													<PencilSimple className="w-3 h-3" />
												</button>
												<button
													onClick={() => handleDeleteExtraPayment(payment.id!)}
													className="btn btn-xs btn-ghost text-error"
													title="Delete extra payment"
												>
													<Trash className="w-3 h-3" />
												</button>
											</>
										)}
									</div>
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
								<th>{t("headers.period")}</th>
								<th>{t("headers.status")}</th>
								<th className="text-right">{t("headers.plannedAmount")}</th>
								<th className="text-right">{t("headers.actualAmount")}</th>
								<th>{t("headers.paymentDate")}</th>
								<th className="text-center">Actions</th>
							</tr>
						</thead>
						<tbody>
							{allExpectedPayments.map((expectedPayment, index) => {
								const {
									month,
									year,
									planned_amount,
									payment,
									extraPayments,
									isOverdue,
									totalActualAmount,
								} = expectedPayment;
								const isPaid = payment?.paid || false;
								const hasExtraPayments = extraPayments.length > 0;

								return (
									<tr
										key={`${year}-${month}`}
										className={`
											${isPaid ? "bg-success/5" : isOverdue ? "bg-error/5" : ""}
										`}
									>
										<td>
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4 text-base-content/50" />
												<span className="font-medium">
													{formatMonthYear(month, year)}
												</span>
											</div>
										</td>
										<td>
											<div className="flex items-center gap-2">
												{isPaid ? (
													<>
														<CheckCircle className="w-4 h-4 text-success" />
														<span className="badge badge-success badge-sm">
															{t("statusPaid")}
														</span>
													</>
												) : isOverdue ? (
													<>
														<XCircle className="w-4 h-4 text-error" />
														<span className="badge badge-error badge-sm">
															{t("statusOverdue")}
														</span>
													</>
												) : (
													<>
														<Calendar className="w-4 h-4 text-warning" />
														<span className="badge badge-warning badge-sm">
															{t("statusPending")}
														</span>
													</>
												)}
											</div>
										</td>
										<td className="text-right font-mono text-sm">
											{formatCurrency(planned_amount)}
										</td>
										<td className="text-right font-mono text-sm">
											{isPaid ? (
												<span
													className={
														totalActualAmount !== planned_amount
															? "text-warning font-medium"
															: ""
													}
												>
													{formatCurrency(totalActualAmount)}
												</span>
											) : hasExtraPayments ? (
												<div className="flex flex-col items-end gap-1">
													<span className="text-base-content/40">-</span>
													<span className="text-xs text-primary">
														{t("hasExtraPayments", {
															count: extraPayments.length,
														})}
													</span>
												</div>
											) : (
												<span className="text-base-content/40">-</span>
											)}
										</td>
										<td className="text-sm text-base-content/70">
											{payment?.paid_date ? (
												formatPaymentDate(payment.paid_date)
											) : (
												<span className="text-base-content/40">-</span>
											)}
										</td>
										<td>
											<div className="flex items-center justify-center gap-1">
												{isPaid && payment?.id ? (
													editingPaymentId === payment.id ? (
														<>
															<input
																type="number"
																value={editAmount}
																onChange={(e) => setEditAmount(e.target.value)}
																className="input input-xs input-bordered w-20 font-mono"
																step="0.01"
															/>
															<button
																onClick={() => handleSaveEdit(payment.id!)}
																className="btn btn-xs btn-success"
																title="Save"
															>
																<CheckCircle className="w-3 h-3" />
															</button>
															<button
																onClick={handleCancelEdit}
																className="btn btn-xs btn-ghost"
																title="Cancel"
															>
																<XCircle className="w-3 h-3" />
															</button>
														</>
													) : (
														<>
															<button
																onClick={() =>
																	handleStartEdit(
																		payment.id!,
																		totalActualAmount,
																	)
																}
																className="btn btn-xs btn-ghost"
																title="Edit amount"
															>
																<PencilSimple className="w-3 h-3" />
															</button>
															<button
																onClick={() => handleUnmarkPayment(payment.id!)}
																className="btn btn-xs btn-ghost text-warning"
																title="Unmark as paid"
															>
																<ArrowCounterClockwise className="w-3 h-3" />
															</button>
														</>
													)
												) : (
													<button
														onClick={() =>
															handleMarkAsPaid(month, year, planned_amount)
														}
														className="btn btn-xs btn-success"
														title="Mark as paid"
													>
														<CheckCircle className="w-3 h-3" />
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr className="font-medium border-t-2">
								<td colSpan={2}>{t("totalLabel")}</td>
								<td className="text-right font-mono">
									{formatCurrency(
										(debt.original_monthly_amount || debt.monthly_amount) *
											(debt.original_number_of_payments ||
												debt.number_of_payments),
									)}
								</td>
								<td className="text-right font-mono">
									{formatCurrency(
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
												(debt.original_monthly_amount || debt.monthly_amount) *
													(debt.original_number_of_payments ||
														debt.number_of_payments) +
												(debt.final_payment || 0),
										),
									)}
								</td>
								<td></td>
								<td></td>
							</tr>
						</tfoot>
					</table>
				</div>

				{allExpectedPayments.length === 0 && (
					<div className="text-center py-8 text-base-content/50">
						<Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
						<p>{t("noPayments")}</p>
					</div>
				)}
			</div>

			{/* Modal de confirmación para reactivar financiación completada */}
			{pendingUnmarkId && (
				<div className="modal modal-open">
					<div className="modal-box max-w-md">
						<div className="flex items-center gap-3 mb-4">
							<WarningCircle size={28} className="text-warning flex-shrink-0" />
							<h3 className="text-lg font-bold">{tDebt("reactivate.title")}</h3>
						</div>
						<p className="text-base-content/80 mb-4">
							{tDebt("reactivate.description")}
						</p>
						<div className="modal-action flex-wrap gap-2">
							<button
								type="button"
								className="btn btn-ghost"
								onClick={() => setPendingUnmarkId(null)}
								disabled={isReactivating}
							>
								{tDebt("reactivate.cancel")}
							</button>
							<button
								type="button"
								className="btn btn-warning"
								onClick={handleConfirmReactivate}
								disabled={isReactivating}
							>
								{isReactivating ? (
									<span className="loading loading-spinner loading-sm"></span>
								) : (
									<ArrowCounterClockwise size={20} />
								)}
								{tDebt("reactivate.confirm")}
							</button>
						</div>
					</div>
					<div
						className="modal-backdrop"
						onClick={() => !isReactivating && setPendingUnmarkId(null)}
					></div>
				</div>
			)}
		</div>
	);
}
