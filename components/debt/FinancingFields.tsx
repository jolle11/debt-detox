"use client";

import { useTranslations } from "next-intl";
import type { UseFormRegisterReturn } from "react-hook-form";
import FormInput from "@/components/ui/FormInput";

type FieldName = "financed_amount" | "tin" | "tae" | "opening_fee";

interface FinancingFieldsProps {
	fields: Record<
		FieldName,
		{ registration: UseFormRegisterReturn; error?: string }
	>;
	defaultOpen?: boolean;
	suggestedMonthly: number | null;
	suggestedLabel: string | null;
	onUseSuggestion: (amount: number) => void;
}

export default function FinancingFields({
	fields,
	defaultOpen = false,
	suggestedMonthly,
	suggestedLabel,
	onUseSuggestion,
}: FinancingFieldsProps) {
	const t = useTranslations("debt.create.financing");
	const hasError = Object.values(fields).some((field) => field.error);
	const inputs: { name: FieldName; label: string; max?: string }[] = [
		{ name: "financed_amount", label: t("financed") },
		{ name: "opening_fee", label: t("fee") },
		{ name: "tin", label: t("tin"), max: "1000" },
		{ name: "tae", label: t("tae"), max: "1000" },
	];

	return (
		<details
			className="rounded-xl border border-base-300 p-4"
			open={defaultOpen || hasError}
		>
			<summary className="cursor-pointer font-medium">{t("title")}</summary>
			<div className="mt-3 space-y-3">
				<p className="text-sm text-base-content/60">{t("help")}</p>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{inputs.map(({ name, label, max }) => (
						<FormInput
							key={name}
							label={label}
							type="number"
							step="0.01"
							min="0"
							max={max}
							registration={fields[name].registration}
							error={fields[name].error}
							placeholder="0.00"
						/>
					))}
				</div>
				{suggestedMonthly !== null && suggestedLabel && (
					<div className="flex flex-wrap items-center justify-between gap-2 text-sm">
						<span>{t("suggested", { amount: suggestedLabel })}</span>
						<button
							type="button"
							className="btn btn-outline btn-xs"
							onClick={() => onUseSuggestion(suggestedMonthly)}
						>
							{t("useSuggested")}
						</button>
					</div>
				)}
			</div>
		</details>
	);
}
