"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import FormInput from "@/components/ui/FormInput";
import type { Debt } from "@/lib/types";

interface EditDebtFormProps {
	debt: Debt;
	onSubmit: (debt: Omit<Debt, "created" | "updated" | "deleted">) => void;
	onCancel: () => void;
	isSubmitting?: boolean;
}

export default function EditDebtForm({
	debt,
	onSubmit,
	onCancel,
	isSubmitting = false,
}: EditDebtFormProps) {
	const t = useTranslations();

	const formatDateForInput = (dateString: string) => {
		if (!dateString) {
			return "";
		}

		// Crear un objeto Date y extraer la fecha en formato YYYY-MM-DD
		const date = new Date(dateString);
		if (isNaN(date.getTime())) {
			return "";
		}

		return date.toISOString().split("T")[0];
	};

	const [formData, setFormData] = useState({
		name: debt.name || "",
		entity: debt.entity || "",
		down_payment: debt.down_payment?.toString() || "",
		first_payment_date: formatDateForInput(debt.first_payment_date || ""),
		monthly_amount: debt.monthly_amount?.toString() || "",
		number_of_payments: debt.number_of_payments?.toString() || "",
		final_payment: debt.final_payment?.toString() || "",
		final_payment_date: formatDateForInput(debt.final_payment_date || ""),
		tin: debt.tin?.toString() || "",
		tae: debt.tae?.toString() || "",
	});

	useEffect(() => {
		setFormData({
			name: debt.name || "",
			entity: debt.entity || "",
			down_payment: debt.down_payment?.toString() || "",
			first_payment_date: formatDateForInput(
				debt.first_payment_date || "",
			),
			monthly_amount: debt.monthly_amount?.toString() || "",
			number_of_payments: debt.number_of_payments?.toString() || "",
			final_payment: debt.final_payment?.toString() || "",
			final_payment_date: formatDateForInput(
				debt.final_payment_date || "",
			),
			tin: debt.tin?.toString() || "",
			tae: debt.tae?.toString() || "",
		});
	}, [debt]);

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const debtData: Omit<Debt, "created" | "updated" | "deleted"> = {
			id: debt.id,
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
			final_payment_date: formData.final_payment_date,
			tin: formData.tin ? Number(formData.tin) : undefined,
			tae: formData.tae ? Number(formData.tae) : undefined,
		};

		onSubmit(debtData);
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title text-2xl mb-6">
					{t("debt.edit.title")}
				</h2>

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
							required
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.tin")}
							type="number"
							value={formData.tin}
							onChange={(value) =>
								handleInputChange("tin", value)
							}
							placeholder="0.00"
						/>

						<FormInput
							label={t("debt.create.tae")}
							type="number"
							value={formData.tae}
							onChange={(value) =>
								handleInputChange("tae", value)
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
								? t("debt.edit.submitting")
								: t("debt.edit.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
