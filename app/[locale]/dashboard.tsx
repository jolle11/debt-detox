"use client";
import { useTranslations, useLocale } from "next-intl";
import SummaryStats from "@/components/dashboard/summary-stats";
import DebtsList from "@/components/dashboard/debts-list";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LandingPage from "@/components/landing/LandingPage";
import CreateDebtModal from "@/components/debt/CreateDebtModal";
import EditDebtModal from "@/components/debt/EditDebtModal";
import DeleteDebtModal from "@/components/debt/DeleteDebtModal";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { usePayments } from "@/hooks/usePayments";
import { useState } from "react";
import type { Debt } from "@/lib/types";
import SkeletonSummaryStats from "@/components/ui/skeletons/SkeletonSummaryStats";
import SkeletonDebtsList from "@/components/ui/skeletons/SkeletonDebtsList";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
	const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
	const { debts, isLoading, error, refetch } = useDebtsContext();

	// Centralizar payments para todos los componentes del dashboard
	const { payments, isLoading: paymentsLoading } = usePayments();

	const authFallback = <LandingPage />;

	return (
		<ProtectedRoute fallback={authFallback}>
			<div className="space-y-4">
				{isLoading || paymentsLoading ? (
					<>
						<SkeletonSummaryStats />
						<SkeletonDebtsList />
					</>
				) : error ? (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				) : (
					<>
						{/* Summary Cards */}
						<SummaryStats debts={debts} />

						{/* Debt List */}
						<DebtsList
							debts={debts}
							payments={payments}
							onEdit={setEditingDebt}
							onDelete={setDeletingDebt}
							onAddDebt={() => setShowCreateModal(true)}
						/>
					</>
				)}
			</div>

			{/* Create Debt Modal */}
			<CreateDebtModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>

			{/* Edit Debt Modal */}
			<EditDebtModal
				debt={editingDebt}
				isOpen={!!editingDebt}
				onClose={() => setEditingDebt(null)}
			/>

			{/* Delete Debt Modal */}
			<DeleteDebtModal
				debt={deletingDebt}
				isOpen={!!deletingDebt}
				onClose={() => setDeletingDebt(null)}
			/>
		</ProtectedRoute>
	);
}
