"use client";

import {
	Calendar,
	CheckCircle,
	CreditCard,
	XCircle,
} from "@phosphor-icons/react";
import { useTranslations, useLocale } from "next-intl";
import SkeletonPaymentsList from "@/components/ui/skeletons/SkeletonPaymentsList";
import { useCurrency } from "@/hooks/useCurrency";
import type { Debt, Payment } from "@/lib/types";

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
	const { formatCurrency } = useCurrency();
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

		const startDate = new Date(debt.first_payment_date);
		const now = new Date();

		for (let i = 0; i < debt.number_of_payments; i++) {
			const paymentDate = new Date(startDate);
			paymentDate.setMonth(paymentDate.getMonth() + i);

			const month = paymentDate.getMonth() + 1;
			const year = paymentDate.getFullYear();

			// Determine if this payment is overdue (past due date and not paid)
			// Set the due date to the same day of month as the first payment
			const dueDate = new Date(paymentDate);
			dueDate.setDate(startDate.getDate());
			const isOverdue = dueDate < now;

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
				planned_amount: debt.monthly_amount,
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
						<div className="text-xs text-success/80">
							{t("statsPaid")}
						</div>
					</div>
					<div className="text-center p-2 bg-error/10 rounded-lg">
						<div className="text-lg font-bold text-error">
							{totalOverduePayments}
						</div>
						<div className="text-xs text-error/80">
							{t("statsOverdue")}
						</div>
					</div>
					<div className="text-center p-2 bg-warning/10 rounded-lg">
						<div className="text-lg font-bold text-warning">
							{totalPendingPayments}
						</div>
						<div className="text-xs text-warning/80">
							{t("statsPending")}
						</div>
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
										(sum, p) =>
											sum + (p.actual_amount || 0),
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
									<span className="font-mono text-sm font-semibold text-primary">
										{formatCurrency(payment.actual_amount || 0)}
									</span>
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
								<th className="text-right">
									{t("headers.plannedAmount")}
								</th>
								<th className="text-right">
									{t("headers.actualAmount")}
								</th>
								<th>{t("headers.paymentDate")}</th>
							</tr>
						</thead>
						<tbody>
							{allExpectedPayments.map(
								(expectedPayment, index) => {
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
									const hasExtraPayments =
										extraPayments.length > 0;

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
														{formatMonthYear(
															month,
															year,
														)}
													</span>
												</div>
											</td>
											<td>
												<div className="flex items-center gap-2">
													{isPaid ? (
														<>
															<CheckCircle className="w-4 h-4 text-success" />
															<span className="badge badge-success badge-sm">
																{t(
																	"statusPaid",
																)}
															</span>
														</>
													) : isOverdue ? (
														<>
															<XCircle className="w-4 h-4 text-error" />
															<span className="badge badge-error badge-sm">
																{t(
																	"statusOverdue",
																)}
															</span>
														</>
													) : (
														<>
															<Calendar className="w-4 h-4 text-warning" />
															<span className="badge badge-warning badge-sm">
																{t(
																	"statusPending",
																)}
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
															totalActualAmount !==
															planned_amount
																? "text-warning font-medium"
																: ""
														}
													>
														{formatCurrency(
															totalActualAmount,
														)}
													</span>
												) : hasExtraPayments ? (
													<div className="flex flex-col items-end gap-1">
														<span className="text-base-content/40">
															-
														</span>
														<span className="text-xs text-primary">
															{t("hasExtraPayments", {
																count: extraPayments.length,
															})}
														</span>
													</div>
												) : (
													<span className="text-base-content/40">
														-
													</span>
												)}
											</td>
											<td className="text-sm text-base-content/70">
												{payment?.paid_date ? (
													formatPaymentDate(
														payment.paid_date,
													)
												) : (
													<span className="text-base-content/40">
														-
													</span>
												)}
											</td>
										</tr>
									);
								},
							)}
						</tbody>
						<tfoot>
							<tr className="font-medium border-t-2">
								<td colSpan={2}>{t("totalLabel")}</td>
								<td className="text-right font-mono">
									{formatCurrency(
										debt.monthly_amount *
											debt.number_of_payments,
									)}
								</td>
								<td className="text-right font-mono">
									{formatCurrency(
										Math.min(
											allExpectedPayments.reduce(
												(sum, ep) =>
													sum + ep.totalActualAmount,
												0,
											) +
												extraPayments.reduce(
													(sum, p) =>
														sum +
														(p.actual_amount || 0),
													0,
												),
											(debt.down_payment || 0) +
												debt.monthly_amount *
													debt.number_of_payments +
												(debt.final_payment || 0),
										),
									)}
								</td>
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
		</div>
	);
}
