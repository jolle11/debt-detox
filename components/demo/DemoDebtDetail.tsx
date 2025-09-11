"use client";

import {
	ArrowLeftIcon,
	CalendarIcon,
	CreditCardIcon,
	FileTextIcon,
	PencilIcon,
	TargetIcon,
	TrashIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import DebtPaymentsList from "@/components/dashboard/DebtPaymentsList";
import DebtProgressWithPayments from "@/components/dashboard/DebtProgressWithPayments";
import { useCurrency } from "@/hooks/useCurrency";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt } from "@/lib/types";
import DemoDebtPaymentStatus from "./DemoDebtPaymentStatus";
import { useDemoContext } from "./DemoProvider";

interface DemoDebtDetailProps {
	debt: Debt;
	onBack: () => void;
	onLoginClick: () => void;
}

export default function DemoDebtDetail({
	debt,
	onBack,
	onLoginClick,
}: DemoDebtDetailProps) {
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
	const debtPayments = payments.filter((p) => p.debt_id === debt.id);
	const paidPayments = debtPayments.filter((p) => p.paid).length;
	const totalPaid =
		(debt.down_payment || 0) +
		debtPayments
			.filter((p) => p.paid)
			.reduce((sum, p) => sum + (p.actual_amount || p.planned_amount), 0);

	const pendingPayments = debt.number_of_payments - paidPayments;
	const pendingAmount = totalAmount - totalPaid;

	// Handlers para la demo
	const demoAlert = () => {
		alert(
			"¡Esta es solo una demo! Regístrate para gestionar tus deudas reales.",
		);
	};

	return (
		<div className="w-full">
			{/* Demo Badge */}
			<div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl mb-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold">
							{tLanding("demo.title")} - {t("debtDetail.title")}
						</h3>
						<p className="text-sm opacity-90">
							{tLanding("demo.subtitle")}
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
					<button onClick={onBack} className="btn btn-ghost btn-sm">
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
								<TargetIcon className="w-5 h-5" />
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
											{t(
												"debtDetail.paymentDetails.paidPayments",
											)}
										</div>
										<div className="text-2xl font-bold text-success">
											{paidPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											{t("debtDetail.paymentDetails.of")}{" "}
											{debt.number_of_payments}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t(
												"debtDetail.paymentDetails.pending",
											)}
										</div>
										<div className="text-2xl font-bold text-warning">
											{pendingPayments}
										</div>
										<div className="text-base text-base-content/70 mt-1">
											{t(
												"debtDetail.paymentDetails.remaining",
											)}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t(
												"debtDetail.paymentDetails.paidAmount",
											)}
										</div>
										<div className="text-lg font-bold text-success">
											{formatCurrency(totalPaid)}
										</div>
									</div>
									<div className="bg-base-200 rounded-xl border border-base-300 p-4">
										<div className="text-base font-medium text-base-content/60 uppercase tracking-wide mb-2">
											{t(
												"debtDetail.paymentDetails.toPay",
											)}
										</div>
										<div className="text-lg font-bold text-warning">
											{formatCurrency(
												Math.max(0, pendingAmount),
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
													{t(
														"debtDetail.structure.downPayment",
													)}
													:
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
											{t(
												"debtDetail.structure.monthlyPayment",
											)}
											:
										</span>
										<span className="font-medium text-lg">
											{formatCurrency(
												debt.monthly_amount,
											)}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-base text-base-content/70">
											{t("debtDetail.structure.duration")}
											:
										</span>
										<span className="font-medium text-lg">
											{debt.number_of_payments}{" "}
											{t("debtDetail.structure.months")}
										</span>
									</div>
									{debt.final_payment !== undefined &&
										debt.final_payment !== null && (
											<div className="flex justify-between items-center">
												<span className="text-base text-base-content/70">
													{t(
														"debtDetail.structure.finalPayment",
													)}
													:
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
												{t(
													"debtDetail.structure.total",
												)}
												:
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
											: t(
													"debtDetail.dates.notSpecified",
												)}
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
					Ve todos los detalles, registra pagos, y gestiona tus deudas
					reales
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
