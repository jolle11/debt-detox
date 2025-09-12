"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import type { Debt } from "@/lib/types";

interface CreateDebtFormProps {
	onSubmit: (
		debt: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted">,
	) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

export default function CreateDebtForm({
	onSubmit,
	onCancel,
	isSubmitting = false,
}: CreateDebtFormProps) {
	const t = useTranslations();

	const [formData, setFormData] = useState({
		name: "",
		entity: "",
		down_payment: "",
		first_payment_date: "",
		monthly_amount: "",
		number_of_payments: "",
		final_payment: "",
		final_payment_date: "",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const calculateFinalPaymentDate = (
		firstPaymentDate: string,
		numberOfPayments: number,
	): string => {
		const firstDate = new Date(firstPaymentDate);
		// Add (numberOfPayments - 1) months to get the final payment date
		const finalDate = new Date(firstDate);
		finalDate.setMonth(finalDate.getMonth() + numberOfPayments - 1);
		return finalDate.toISOString().split("T")[0];
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Calculate final payment date if not provided
		let finalPaymentDate = formData.final_payment_date;
		if (
			!finalPaymentDate &&
			formData.first_payment_date &&
			formData.number_of_payments
		) {
			finalPaymentDate = calculateFinalPaymentDate(
				formData.first_payment_date,
				Number(formData.number_of_payments),
			);
		}

		const debtData: Omit<Debt, "id" | "user_id" | "created" | "updated" | "deleted"> = {
			name: formData.name,
			entity: formData.entity,
			down_payment: formData.down_payment
				? Number(formData.down_payment)
				: undefined,
			first_payment_date: formData.first_payment_date,
			monthly_amount: Number(formData.monthly_amount),
			number_of_payments: Number(formData.number_of_payments),
			final_payment: formData.final_payment
				? Number(formData.final_payment)
				: undefined,
			final_payment_date: finalPaymentDate,
		};

		onSubmit(debtData);
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.name")}
							value={formData.name}
							onChange={(value) =>
								handleInputChange("name", value)
							}
							placeholder={t("debt.create.namePlaceholder")}
							required
						/>

						<FormInput
							label={t("debt.create.entity")}
							value={formData.entity}
							onChange={(value) =>
								handleInputChange("entity", value)
							}
							placeholder={t("debt.create.entityPlaceholder")}
							required
						/>
					</div>

					{/* Entrada */}
					<div className="grid grid-cols-1 gap-4">
						<FormInput
							label={t("debt.create.downPayment")}
							type="number"
							value={formData.down_payment}
							onChange={(value) =>
								handleInputChange("down_payment", value)
							}
							placeholder="0.00"
						/>
					</div>

					{/* Fechas de cuotas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.firstPaymentDate")}
							type="date"
							value={formData.first_payment_date}
							onChange={(value) =>
								handleInputChange("first_payment_date", value)
							}
							required
						/>

						<FormInput
							label={t("debt.create.finalPaymentDate")}
							type="date"
							value={formData.final_payment_date}
							onChange={(value) =>
								handleInputChange("final_payment_date", value)
							}
						/>
					</div>

					{/* Importes y cuotas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.monthlyAmount")}
							type="number"
							value={formData.monthly_amount}
							onChange={(value) =>
								handleInputChange("monthly_amount", value)
							}
							placeholder="0.00"
							required
						/>

						<FormInput
							label={t("debt.create.numberOfPayments")}
							type="number"
							value={formData.number_of_payments}
							onChange={(value) =>
								handleInputChange("number_of_payments", value)
							}
							placeholder="12"
							required
						/>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<FormInput
							label={t("debt.create.finalPayment")}
							type="number"
							value={formData.final_payment}
							onChange={(value) =>
								handleInputChange("final_payment", value)
							}
							placeholder="0.00"
						/>
					</div>

					<div className="card-actions justify-end mt-8">
						<button
							type="button"
							className="btn btn-ghost"
							onClick={onCancel}
							disabled={isSubmitting}
						>
							{t("common.cancel")}
						</button>
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isSubmitting}
						>
							{isSubmitting
								? t("debt.create.submitting")
								: t("debt.create.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
