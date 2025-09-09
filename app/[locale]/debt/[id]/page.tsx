"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
	ArrowLeftIcon,
	CalendarIcon,
	CreditCardIcon,
	CurrencyDollarIcon,
	FileTextIcon,
	BuildingsIcon,
	CalendarCheckIcon,
	TargetIcon,
	PencilIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { calculateDebtStatus } from "@/lib/format";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Debt, Payment } from "@/lib/types";
import DebtProgressWithPayments from "@/components/dashboard/debt-progress-with-payments";
import DebtPaymentStatus from "@/components/dashboard/debt-payment-status";
import DebtPaymentsList from "@/components/dashboard/debt-payments-list";
import EditDebtModal from "@/components/debt/EditDebtModal";
import DeleteDebtModal from "@/components/debt/DeleteDebtModal";
import { usePayments } from "@/hooks/usePayments";
import SkeletonDebtDetail from "@/components/ui/skeletons/SkeletonDebtDetail";

export default function DebtDetailPage() {
	const t = useTranslations();
	const params = useParams();
	const router = useRouter();
	const { user, loading: authLoading } = useAuthRedirect();
	const { debts, isLoading: debtsLoading, refetch } = useDebtsContext();
	const { formatCurrency } = useCurrency();
	const [debt, setDebt] = useState<Debt | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const {
		payments,
		isLoading: paymentsLoading,
		refetch: refetchPayments,
	} = usePayments(debt?.id);

	useEffect(() => {
		setIsClient(true);
	}, []);

	useEffect(() => {
		const debtId = params.id as string;
		const foundDebt = debts.find((d) => d.id === debtId);
		setDebt(foundDebt || null);
	}, [params.id, debts]);

	// Show loading skeleton during SSR or while loading
	if (!isClient || authLoading || debtsLoading || paymentsLoading || !user) {
		return <SkeletonDebtDetail />;
	}

	// Show not found only after client-side hydration
	if (!debt) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex items-center justify-center min-h-[50vh]">
					<div className="text-center">
						<h2 className="text-xl font-semibold mb-2">
							{t("debtDetail.notFound.title")}
						</h2>
						<p className="text-base-content/70 mb-4">
							{t("debtDetail.notFound.description")}
						</p>
						<button
							onClick={() => router.back()}
							className="btn btn-primary"
						>
							{t("common.back")}
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
		if (typeof window === 'undefined') return dateString; // SSR fallback
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Calcular cuotas que deberían estar pagadas según fechas
	const calculateExpectedPaidPayments = () => {
		if (typeof window === 'undefined') return 0; // SSR
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
						{t("common.back")}
					</button>
					<div className="flex items-center gap-2">
						<div>
							<h1 className="text-xl font-bold">{debt.name}</h1>
							<p className="text-sm text-base-content/70">
								{debt.entity}
							</p>
						</div>
						<div className="flex items-center gap-1">
							<button
								onClick={() => setShowEditModal(true)}
								className="btn btn-ghost btn-sm"
								title={t("common.edit")}
							>
								<PencilIcon className="w-4 h-4" />
							</button>
							<button
								onClick={() => setShowDeleteModal(true)}
								className="btn btn-ghost btn-sm text-error hover:bg-error/10"
								title={t("common.delete")}
							>
								<TrashIcon className="w-4 h-4" />
							</button>
						</div>
					</div>
				</div>
				<div
					className={`badge ${status === "completed" ? "badge-success" : status === "active" ? "badge-primary" : "badge-warning"}`}
				>
					{status === "completed"
						? t("debtDetail.status.completed")
						: status === "active"
							? t("debtDetail.status.active")
							: t("debtDetail.status.pending")}
				</div>
			</div>

			{/* Quick Stats Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t("debtDetail.summary.total")}
					</div>
					<div className="text-xl font-bold text-primary">
						{formatCurrency(totalAmount)}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t("debtDetail.summary.paid")}
					</div>
					<div className="text-xl font-bold text-success">
						{formatCurrency(paymentStats.effectivePaidAmount)}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t("debtDetail.summary.payments")}
					</div>
					<div className="text-xl font-bold text-info">
						{paymentStats.effectivePaidPayments}/
						{debt.number_of_payments}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t("debtDetail.summary.monthly")}
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
								{t("debtDetail.sections.progress")}
							</h2>
							<DebtProgressWithPayments
								debt={debt}
								payments={payments}
								isLoading={paymentsLoading}
							/>
							<div className="mt-3">
								<DebtPaymentStatus
									debt={debt}
									payments={payments}
								/>
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
									{t("debtDetail.sections.paymentDetails")}
								</h2>
								<div className="grid grid-cols-2 gap-4">
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t("debtDetail.paymentDetails.paidPayments")}
										</div>
										<div className="text-2xl font-bold text-success">
											{paymentStats.effectivePaidPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											{t("debtDetail.paymentDetails.of")} {debt.number_of_payments}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t("debtDetail.paymentDetails.pending")}
										</div>
										<div className="text-2xl font-bold text-warning">
											{paymentStats.pendingPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											{t("debtDetail.paymentDetails.remaining")}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t("debtDetail.paymentDetails.paidAmount")}
										</div>
										<div className="text-lg font-bold text-success">
											{formatCurrency(
												paymentStats.effectivePaidAmount,
											)}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t("debtDetail.paymentDetails.toPay")}
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
									{t("debtDetail.sections.structure")}
								</h2>
								<div className="space-y-4">
									{debt.down_payment !== undefined &&
										debt.down_payment !== null && (
											<div className="flex justify-between items-center">
												<span className="text-base text-base-content/70">
													{t("debtDetail.structure.downPayment")}:
												</span>
												<span className="font-medium text-lg">
													{debt.down_payment > 0
														? formatCurrency(
																debt.down_payment,
															)
														: t(
																"debtDetail.structure.notApplicable",
															)}
												</span>
											</div>
										)}
									<div className="flex justify-between items-center">
										<span className="text-base text-base-content/70">
											{t("debtDetail.structure.monthlyPayment")}:
										</span>
										<span className="font-medium text-lg">
											{formatCurrency(
												debt.monthly_amount,
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-base text-base-content/70">
											{t("debtDetail.structure.duration")}:
										</span>
										<span className="font-medium text-lg">
											{debt.number_of_payments} {t("debtDetail.structure.months")}
										</span>
									</div>
									{debt.final_payment !== undefined &&
										debt.final_payment !== null && (
											<div className="flex justify-between items-center">
												<span className="text-base text-base-content/70">
													{t("debtDetail.structure.finalPayment")}:
												</span>
												<span className="font-medium text-lg">
													{debt.final_payment > 0
														? formatCurrency(
																debt.final_payment,
															)
														: t(
																"debtDetail.structure.notApplicable",
															)}
												</span>
											</div>
										)}
									<div className="bg-base-300 rounded-lg p-4 mt-6">
										<div className="flex justify-between items-center">
											<span className="text-base font-medium">
												{t("debtDetail.structure.total")}:
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
									{t("debtDetail.sections.product")}
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
								{t("debtDetail.sections.dates")}
							</h2>
							<div className="space-y-5">
								<div>
									<div className="text-base text-base-content/70 mb-2">
										{t("debtDetail.dates.firstPayment")}
									</div>
									<div className="text-lg font-medium">
										{formatDate(debt.first_payment_date)}
									</div>
								</div>
								<div>
									<div className="text-base text-base-content/70 mb-2">
										{t("debtDetail.dates.lastPayment")}
									</div>
									<div className="text-lg font-medium">
										{debt.final_payment_date
											? formatDate(
													debt.final_payment_date,
												)
											: t("debtDetail.dates.notSpecified")}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Edit Modal */}
			<EditDebtModal
				debt={debt}
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				onSuccess={() => {
					setShowEditModal(false);
				}}
			/>

			{/* Delete Modal */}
			<DeleteDebtModal
				debt={debt}
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onSuccess={() => {
					router.push("/"); // Redirect to dashboard after delete
				}}
			/>
		</div>
	);
}
