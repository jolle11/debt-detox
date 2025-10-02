"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import type { Debt } from "@/lib/types";
import DebtPaymentsList from "@/components/dashboard/DebtPaymentsList";
import EditDebtModal from "@/components/debt/EditDebtModal";
import DeleteDebtModal from "@/components/debt/DeleteDebtModal";
import CompleteDebtModal from "@/components/debt/CompleteDebtModal";
import AddExtraPaymentModal from "@/components/debt/AddExtraPaymentModal";
import { usePayments } from "@/hooks/usePayments";
import SkeletonDebtDetail from "@/components/ui/skeletons/SkeletonDebtDetail";
import DebtHeader from "@/components/debt/detail/DebtHeader";
import DebtQuickStats from "@/components/debt/detail/DebtQuickStats";
import DebtProgressSection from "@/components/debt/detail/DebtProgressSection";
import DebtPaymentDetails from "@/components/debt/detail/DebtPaymentDetails";
import DebtStructure from "@/components/debt/detail/DebtStructure";
import DebtDates from "@/components/debt/detail/DebtDates";
import DebtProductImage from "@/components/debt/detail/DebtProductImage";
import DebtNotFound from "@/components/debt/detail/DebtNotFound";
import { calculatePaymentStats } from "@/utils/debtCalculations";
import { useTranslations } from "next-intl";

export default function DebtDetailPage() {
	const t = useTranslations();
	const params = useParams();
	const router = useRouter();
	const { user, loading: authLoading } = useAuthRedirect();
	const { debts, isLoading: debtsLoading } = useDebtsContext();
	const { formatCurrency } = useCurrency();
	const [debt, setDebt] = useState<Debt | null>(null);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [showCompleteModal, setShowCompleteModal] = useState(false);
	const [showExtraPaymentModal, setShowExtraPaymentModal] = useState(false);
	const [isClient, setIsClient] = useState(false);
	const { payments, isLoading: paymentsLoading } = usePayments(debt?.id);

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
		return <DebtNotFound onBack={() => router.back()} />;
	}

	const totalAmount =
		(debt.down_payment || 0) +
		debt.monthly_amount * debt.number_of_payments +
		(debt.final_payment || 0);

	const paymentStats = calculatePaymentStats(debt, payments);
	const isFullyPaid = paymentStats.pendingAmount === 0;
	const isCompleted =
		debt.final_payment_date &&
		new Date(debt.final_payment_date) <= new Date();

	return (
		<div className="container mx-auto px-4 py-6">
			<DebtHeader
				debt={debt}
				payments={payments}
				formatCurrency={formatCurrency}
				onEdit={() => setShowEditModal(true)}
				onDelete={() => setShowDeleteModal(true)}
				onComplete={() => setShowCompleteModal(true)}
				onAddExtraPayment={() => setShowExtraPaymentModal(true)}
				onBack={() => router.back()}
			/>

			{/* Alert when debt is fully paid but not marked as completed */}
			{isFullyPaid && !isCompleted && (
				<div className="alert alert-success mb-4 shadow-lg">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<div>
						<h3 className="font-bold">
							{t("debtDetail.fullyPaidAlert.title")}
						</h3>
						<div className="text-sm">
							{t("debtDetail.fullyPaidAlert.description")}
						</div>
					</div>
					<button
						className="btn btn-sm"
						onClick={() => setShowCompleteModal(true)}
					>
						{t("debtDetail.fullyPaidAlert.completeButton")}
					</button>
				</div>
			)}

			<DebtQuickStats
				debt={debt}
				payments={payments}
				formatCurrency={formatCurrency}
				paymentStats={paymentStats}
				totalAmount={totalAmount}
			/>

			{/* Main Content - More compact grid */}
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
				{/* Main Content - Reorganized into 4 columns */}
				<div className="xl:col-span-3 space-y-4">
					<DebtProgressSection
						debt={debt}
						payments={payments}
						formatCurrency={formatCurrency}
						isLoading={paymentsLoading}
					/>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						<DebtPaymentDetails
							debt={debt}
							payments={payments}
							formatCurrency={formatCurrency}
							paymentStats={paymentStats}
						/>

						<DebtStructure
							debt={debt}
							payments={payments}
							formatCurrency={formatCurrency}
							totalAmount={totalAmount}
						/>
					</div>

					{/* Payments List */}
					<DebtPaymentsList
						debt={debt}
						payments={payments}
						isLoading={paymentsLoading}
					/>

					<DebtProductImage
						debt={debt}
						payments={payments}
						formatCurrency={formatCurrency}
					/>
				</div>

				<div className="space-y-6">
					<DebtDates
						debt={debt}
						payments={payments}
						formatCurrency={formatCurrency}
					/>
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

			{/* Complete Modal */}
			<CompleteDebtModal
				debt={debt}
				isOpen={showCompleteModal}
				onClose={() => setShowCompleteModal(false)}
				onSuccess={() => {
					setShowCompleteModal(false);
				}}
			/>

			{/* Extra Payment Modal */}
			<AddExtraPaymentModal
				debt={debt}
				isOpen={showExtraPaymentModal}
				onClose={() => setShowExtraPaymentModal(false)}
				onSuccess={() => {
					setShowExtraPaymentModal(false);
				}}
			/>
		</div>
	);
}
