"use client";
import { SlidersHorizontalIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import InvitationInbox from "@/components/collaboration/InvitationInbox";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import DashboardWidgetEditor from "@/components/dashboard/DashboardWidgetEditor";
import DebtsList from "@/components/dashboard/DebtsList";
import SummaryStats from "@/components/dashboard/SummaryStats";
import CompleteDebtModal from "@/components/debt/CompleteDebtModal";
import CreateDebtModal from "@/components/debt/CreateDebtModal";
import DeleteDebtModal from "@/components/debt/DeleteDebtModal";
import EditDebtModal from "@/components/debt/EditDebtModal";
import LandingPage from "@/components/landing/LandingPage";
import SkeletonDebtsList from "@/components/ui/skeletons/SkeletonDebtsList";
import SkeletonSummaryStats from "@/components/ui/skeletons/SkeletonSummaryStats";
import { useDebtsContext } from "@/contexts/DebtsContext";
import { useDashboardWidgets } from "@/hooks/useDashboardWidgets";
import { usePayments } from "@/hooks/usePayments";
import type { Debt } from "@/lib/types";

export default function Dashboard() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
	const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
	const [completingDebt, setCompletingDebt] = useState<Debt | null>(null);
	const [showWidgetEditor, setShowWidgetEditor] = useState(false);
	const t = useTranslations("dashboard.customize");
	const { debts, isLoading, error } = useDebtsContext();
	const { widgets, saveWidgets, isSaving } = useDashboardWidgets();

	// Centralizar payments para todos los componentes del dashboard
	const {
		payments,
		isLoading: paymentsLoading,
		markPaymentAsPaid,
	} = usePayments();

	const authFallback = <LandingPage />;

	return (
		<ProtectedRoute fallback={authFallback}>
			<div className="space-y-4">
				<InvitationInbox />
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
						<div className="flex justify-end">
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={() => setShowWidgetEditor(true)}
							>
								<SlidersHorizontalIcon className="w-4 h-4" />
								{widgets.length === 0 ? t("addWidgets") : t("button")}
							</button>
						</div>

						<SummaryStats debts={debts} payments={payments} widgets={widgets} />

						{/* Debt List */}
						<DebtsList
							debts={debts}
							payments={payments}
							onMarkPaymentAsPaid={markPaymentAsPaid}
							onEdit={setEditingDebt}
							onDelete={setDeletingDebt}
							onComplete={setCompletingDebt}
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

			{/* Complete Debt Modal */}
			<CompleteDebtModal
				debt={completingDebt}
				isOpen={!!completingDebt}
				onClose={() => setCompletingDebt(null)}
			/>

			<DashboardWidgetEditor
				isOpen={showWidgetEditor}
				widgets={widgets}
				isSaving={isSaving}
				onClose={() => setShowWidgetEditor(false)}
				onSave={async (nextWidgets) => {
					try {
						await saveWidgets(nextWidgets);
						toast.success(t("saved"));
						setShowWidgetEditor(false);
					} catch {
						toast.error(t("saveError"));
					}
				}}
			/>
		</ProtectedRoute>
	);
}
