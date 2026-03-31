"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import { type EditDebtFormData, editDebtSchema } from "@/lib/schemas";
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
	const tv = useTranslations("validation");

	const formatDateForInput = (dateString: string) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		if (Number.isNaN(date.getTime())) return "";
		return date.toISOString().split("T")[0];
	};

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<EditDebtFormData>({
		resolver: zodResolver(editDebtSchema),
		defaultValues: {
			name: debt.name || "",
			entity: debt.entity || "",
			down_payment: debt.down_payment ?? undefined,
			first_payment_date: formatDateForInput(debt.first_payment_date || ""),
			monthly_amount: debt.monthly_amount,
			number_of_payments: debt.number_of_payments,
			final_payment: debt.final_payment ?? undefined,
			final_payment_date: formatDateForInput(debt.final_payment_date || ""),
		},
	});

	useEffect(() => {
		reset({
			name: debt.name || "",
			entity: debt.entity || "",
			down_payment: debt.down_payment ?? undefined,
			first_payment_date: formatDateForInput(debt.first_payment_date || ""),
			monthly_amount: debt.monthly_amount,
			number_of_payments: debt.number_of_payments,
			final_payment: debt.final_payment ?? undefined,
			final_payment_date: formatDateForInput(debt.final_payment_date || ""),
		});
	}, [debt, reset]);

	const calculateFinalPaymentDate = (
		firstPaymentDate: string,
		numberOfPayments: number,
	): string => {
		const firstDate = new Date(firstPaymentDate);
		const finalDate = new Date(firstDate);
		finalDate.setMonth(finalDate.getMonth() + numberOfPayments - 1);
		return finalDate.toISOString().split("T")[0];
	};

	const onFormSubmit = (data: EditDebtFormData) => {
		let finalPaymentDate = data.final_payment_date || "";
		if (data.first_payment_date && data.number_of_payments) {
			finalPaymentDate = calculateFinalPaymentDate(
				data.first_payment_date,
				data.number_of_payments,
			);
		}

		const debtData: Omit<Debt, "created" | "updated" | "deleted"> = {
			id: debt.id,
			user_id: debt.user_id,
			name: data.name,
			entity: data.entity,
			down_payment: data.down_payment || undefined,
			first_payment_date: data.first_payment_date,
			monthly_amount: data.monthly_amount,
			number_of_payments: data.number_of_payments,
			final_payment: data.final_payment || undefined,
			final_payment_date: finalPaymentDate || undefined,
		};

		onSubmit(debtData);
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.name")}
							registration={register("name")}
							placeholder={t("debt.create.namePlaceholder")}
							error={errors.name?.message ? tv("required") : undefined}
						/>

						<FormInput
							label={t("debt.create.entity")}
							registration={register("entity")}
							placeholder={t("debt.create.entityPlaceholder")}
							error={errors.entity?.message ? tv("required") : undefined}
						/>
					</div>

					{/* Entrada */}
					<div className="grid grid-cols-1 gap-4">
						<FormInput
							label={t("debt.create.downPayment")}
							type="number"
							registration={register("down_payment")}
							placeholder="0.00"
						/>
					</div>

					{/* Fechas de cuotas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.firstPaymentDate")}
							type="date"
							registration={register("first_payment_date")}
							error={
								errors.first_payment_date?.message ? tv("required") : undefined
							}
						/>

						<FormInput
							label={t("debt.create.finalPaymentDate")}
							type="date"
							registration={register("final_payment_date")}
						/>
					</div>

					{/* Importes y cuotas */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.monthlyAmount")}
							type="number"
							registration={register("monthly_amount")}
							placeholder="0.00"
							error={
								errors.monthly_amount?.message ? tv("positive") : undefined
							}
						/>

						<FormInput
							label={t("debt.create.numberOfPayments")}
							type="number"
							registration={register("number_of_payments")}
							placeholder="12"
							error={
								errors.number_of_payments?.message ? tv("positive") : undefined
							}
						/>
					</div>

					<div className="grid grid-cols-1 gap-4">
						<FormInput
							label={t("debt.create.finalPayment")}
							type="number"
							registration={register("final_payment")}
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
							{isSubmitting ? t("debt.edit.submitting") : t("debt.edit.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
