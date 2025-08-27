"use client";
import { useTranslations, useLocale } from "next-intl";
import SummaryStats from "@/components/dashboard/summary-stats";
import DebtsList from "@/components/dashboard/debts-list";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthModal from "@/components/auth/AuthModal";
import CreateDebtModal from "@/components/debt/CreateDebtModal";
import EditDebtModal from "@/components/debt/EditDebtModal";
import DeleteDebtModal from "@/components/debt/DeleteDebtModal";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { useState } from "react";
import type { Debt } from "@/lib/types";
import SkeletonSummaryStats from "@/components/ui/skeletons/SkeletonSummaryStats";
import SkeletonDebtsList from "@/components/ui/skeletons/SkeletonDebtsList";

export default function Dashboard() {
	const t = useTranslations();
	const tAuth = useTranslations("auth");
	const locale = useLocale();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
	const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
	const { debts, isLoading, error, refetch } = useDebtsContext();

	const authFallback = (
		<div className="flex items-center justify-center min-h-[60vh]">
			<div className="text-center space-y-4">
				<h2 className="text-3xl font-bold">{tAuth("welcome.title")}</h2>
				<p className="text-gray-600 max-w-md">
					{tAuth("welcome.message")}
				</p>
				<button
					className="btn btn-primary btn-lg"
					onClick={() => setShowAuthModal(true)}
				>
					{tAuth("loginRegisterButton")}
				</button>
				<AuthModal
					isOpen={showAuthModal}
					onClose={() => setShowAuthModal(false)}
				/>
			</div>
		</div>
	);

	return (
		<ProtectedRoute fallback={authFallback}>
			<div className="space-y-4">
				{isLoading ? (
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
				onSuccess={refetch}
			/>

			{/* Edit Debt Modal */}
			<EditDebtModal
				debt={editingDebt}
				isOpen={!!editingDebt}
				onClose={() => setEditingDebt(null)}
				onSuccess={refetch}
			/>

			{/* Delete Debt Modal */}
			<DeleteDebtModal
				debt={deletingDebt}
				isOpen={!!deletingDebt}
				onClose={() => setDeletingDebt(null)}
				onSuccess={refetch}
			/>
		</ProtectedRoute>
	);
}
