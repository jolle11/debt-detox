"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import { type CreateDebtFormData, createDebtSchema } from "@/lib/schemas";
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
	const tv = useTranslations("validation");

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateDebtFormData>({
		resolver: zodResolver(createDebtSchema),
		defaultValues: {
			name: "",
			entity: "",
			down_payment: undefined,
			first_payment_date: "",
			monthly_amount: undefined,
			number_of_payments: undefined,
			final_payment: undefined,
			final_payment_date: "",
		},
	});

	const onFormSubmit = (data: CreateDebtFormData) => {
		let finalPaymentDate = data.final_payment_date || "";
		if (data.first_payment_date && data.number_of_payments) {
			finalPaymentDate = resolveFinalPaymentDate({
				first_payment_date: data.first_payment_date,
				number_of_payments: data.number_of_payments,
				final_payment: data.final_payment,
				final_payment_date: data.final_payment_date || undefined,
			});
		}

		const debtData: Omit<
			Debt,
			"id" | "user_id" | "created" | "updated" | "deleted"
		> = {
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
							step="0.01"
							min="0"
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
							step="0.01"
							min="0.01"
							registration={register("monthly_amount")}
							placeholder="0.00"
							error={
								errors.monthly_amount?.message ? tv("positive") : undefined
							}
						/>

						<FormInput
							label={t("debt.create.numberOfPayments")}
							type="number"
							step="1"
							min="1"
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
							step="0.01"
							min="0"
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
