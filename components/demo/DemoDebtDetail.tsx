"use client";

import { useTranslations } from "next-intl";
import { ArrowLeftIcon, PencilIcon, TrashIcon } from "@phosphor-icons/react";
import { useDemoContext } from "./DemoProvider";
import { calculateDebtStatus } from "@/lib/format";
import { useCurrency } from "@/hooks/useCurrency";
import type { Debt } from "@/lib/types";
import DebtProgressWithPayments from "@/components/dashboard/debt-progress-with-payments";
import DemoDebtPaymentStatus from "./DemoDebtPaymentStatus";
import DebtPaymentsList from "@/components/dashboard/debt-payments-list";

interface DemoDebtDetailProps {
	debt: Debt;
	onBack: () => void;
	onLoginClick: () => void;
}

export default function DemoDebtDetail({ debt, onBack, onLoginClick }: DemoDebtDetailProps) {
	const t = useTranslations();
	const tLanding = useTranslations("landing");
	const { formatCurrency } = useCurrency();
	const { payments } = useDemoContext();
	
	const status = calculateDebtStatus(debt.final_payment_date);
	const totalAmount =
		(debt.down_payment || 0) +
		debt.monthly_amount * debt.number_of_payments +
		(debt.final_payment || 0);

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	// Calcular estadísticas de pagos para la demo
	const debtPayments = payments.filter(p => p.debt_id === debt.id);
	const paidPayments = debtPayments.filter(p => p.paid).length;
	const totalPaid = (debt.down_payment || 0) + debtPayments
		.filter(p => p.paid)
		.reduce((sum, p) => sum + (p.actual_amount || p.planned_amount), 0);
	
	const pendingPayments = debt.number_of_payments - paidPayments;
	const pendingAmount = totalAmount - totalPaid;

	// Handlers para la demo
	const demoAlert = () => {
		alert("¡Esta es solo una demo! Regístrate para gestionar tus deudas reales.");
	};

	return (
		<div className="w-full">
			{/* Demo Badge */}
			<div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl mb-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold">
							{tLanding("demo.title")} - Detalle de Deuda
						</h3>
						<p className="text-sm opacity-90">
							Explora todos los detalles y gráficos de progreso
						</p>
					</div>
					<button
						onClick={onLoginClick}
						className="btn btn-outline btn-accent btn-sm text-white border-white hover:bg-white hover:text-primary"
					>
						{tLanding("demo.cta")}
					</button>
				</div>
			</div>

			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<button
						onClick={onBack}
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
								onClick={demoAlert}
								className="btn btn-ghost btn-sm"
								title={t("common.edit")}
							>
								<PencilIcon className="w-4 h-4" />
							</button>
							<button
								onClick={demoAlert}
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
						{formatCurrency(totalPaid)}
					</div>
				</div>
				<div className="bg-base-100 rounded-xl border border-base-300 p-4 hover:shadow-lg transition-shadow duration-200">
					<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
						{t("debtDetail.summary.payments")}
					</div>
					<div className="text-xl font-bold text-info">
						{paidPayments}/{debt.number_of_payments}
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

			{/* Main Content */}
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
				<div className="xl:col-span-3 space-y-4">
					{/* Progress Section */}
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body p-4">
							<h2 className="card-title text-lg mb-2">
								{t("debtDetail.sections.progress")}
							</h2>
							<DebtProgressWithPayments
								debt={debt}
								payments={debtPayments}
								isLoading={false}
							/>
							<div className="mt-3">
								<DemoDebtPaymentStatus
									debt={debt}
									payments={debtPayments}
								/>
							</div>
						</div>
					</div>

					{/* Payments List */}
					<DebtPaymentsList
						debt={debt}
						payments={debtPayments}
						isLoading={false}
					/>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					{/* Dates */}
					<div className="card bg-base-100 shadow">
						<div className="card-body p-5">
							<h2 className="card-title text-xl mb-4">
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
											? formatDate(debt.final_payment_date)
											: t("debtDetail.dates.notSpecified")}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Bottom CTA */}
			<div className="mt-8 p-6 bg-base-100 rounded-xl border-2 border-dashed border-primary/20 text-center">
				<h3 className="text-xl font-bold mb-2">
					{tLanding("demo.bottomCta.title")}
				</h3>
				<p className="text-base-content/70 mb-4">
					Ve todos los detalles, registra pagos, y gestiona tus deudas reales
				</p>
				<button
					onClick={onLoginClick}
					className="btn btn-primary btn-lg"
				>
					{tLanding("demo.bottomCta.button")}
				</button>
			</div>
		</div>
	);
}