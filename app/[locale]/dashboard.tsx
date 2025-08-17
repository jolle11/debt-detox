"use client";
import { useTranslations, useLocale } from "next-intl";
import SummaryStats from "@/components/dashboard/summary-stats";
import DebtsList from "@/components/dashboard/debts-list";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthModal from "@/components/auth/AuthModal";
import EditDebtModal from "@/components/debt/EditDebtModal";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { useState } from "react";
import type { Debt } from "@/lib/types";

export default function Dashboard() {
	const t = useTranslations();
	const tAuth = useTranslations("auth");
	const locale = useLocale();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
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
			<div className="space-y-6">
				{isLoading ? (
					<div className="flex justify-center items-center h-64">
						<span className="loading loading-spinner loading-lg"></span>
					</div>
				) : error ? (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				) : (
					<>
						{/* Summary Cards */}
						<SummaryStats debts={debts} />

						{/* Debt List */}
						<DebtsList debts={debts} onEdit={setEditingDebt} />
					</>
				)}
			</div>
			{/* Edit Debt Modal */}
			<EditDebtModal
				debt={editingDebt}
				isOpen={!!editingDebt}
				onClose={() => setEditingDebt(null)}
				onSuccess={refetch}
			/>
		</ProtectedRoute>
	);
}
