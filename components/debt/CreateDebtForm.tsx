"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import FormInput from "@/components/ui/FormInput";
import type { Debt } from "@/lib/types";

interface CreateDebtFormProps {
	onSubmit: (
		debt: Omit<Debt, "id" | "created" | "updated" | "deleted">,
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
		start_date: "",
		end_date: "",
		initial_amount: "",
		final_amount: "",
		tin: "",
		tae: "",
	});

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const debtData: Omit<Debt, "id" | "created" | "updated" | "deleted"> = {
			name: formData.name,
			entity: formData.entity,
			start_date: formData.start_date,
			end_date: formData.end_date,
			final_amount: Number(formData.final_amount),
			initial_amount: formData.initial_amount
				? Number(formData.initial_amount)
				: undefined,
			tin: formData.tin ? Number(formData.tin) : undefined,
			tae: formData.tae ? Number(formData.tae) : undefined,
		};

		onSubmit(debtData);
	};

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body">
				<h2 className="card-title text-2xl mb-6">
					{t("debt.create.title")}
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.startDate")}
							type="date"
							value={formData.start_date}
							onChange={(value) =>
								handleInputChange("start_date", value)
							}
							required
						/>

						<FormInput
							label={t("debt.create.endDate")}
							type="date"
							value={formData.end_date}
							onChange={(value) =>
								handleInputChange("end_date", value)
							}
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<FormInput
							label={t("debt.create.initialAmount")}
							type="number"
							value={formData.initial_amount}
							onChange={(value) =>
								handleInputChange("initial_amount", value)
							}
							placeholder="0.00"
						/>

						<FormInput
							label={t("debt.create.finalAmount")}
							type="number"
							value={formData.final_amount}
							onChange={(value) =>
								handleInputChange("final_amount", value)
							}
							placeholder="0.00"
							required
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
								? t("debt.create.submitting")
								: t("debt.create.submit")}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
