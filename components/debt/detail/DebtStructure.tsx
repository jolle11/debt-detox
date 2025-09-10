"use client";

import { FileTextIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { DebtStructureProps } from "@/data/debtDetail";

export default function DebtStructure({
	debt,
	formatCurrency,
	totalAmount,
}: DebtStructureProps) {
	const t = useTranslations();

	const structureItems = [
		{
			key: "downPayment",
			value: debt.down_payment,
			show: debt.down_payment !== undefined && debt.down_payment !== null,
		},
		{
			key: "monthlyPayment",
			value: debt.monthly_amount,
			show: true,
		},
		{
			key: "duration",
			value: `${debt.number_of_payments} ${t("debtDetail.structure.months")}`,
			show: true,
			isString: true,
		},
		{
			key: "finalPayment",
			value: debt.final_payment,
			show:
				debt.final_payment !== undefined && debt.final_payment !== null,
		},
	];

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5">
				<h2 className="card-title text-xl mb-4">
					<FileTextIcon className="w-6 h-6" />
					{t("debtDetail.sections.structure")}
				</h2>
				<div className="space-y-4">
					{structureItems.map(({ key, value, show, isString }) => {
						if (!show) return null;

						return (
							<div
								key={key}
								className="flex justify-between items-center"
							>
								<span className="text-base text-base-content/70">
									{t(`debtDetail.structure.${key}`)}:
								</span>
								<span className="font-medium text-lg">
									{isString
										? value
										: value && value > 0
											? formatCurrency(value)
											: t(
													"debtDetail.structure.notApplicable",
												)}
								</span>
							</div>
						);
					})}
					<div className="bg-base-300 rounded-lg p-4 mt-6">
						<div className="flex justify-between items-center">
							<span className="text-base font-medium">
								{t("debtDetail.structure.total")}:
							</span>
							<span className="font-bold text-2xl">
								{formatCurrency(totalAmount)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
