"use client";

import { CalendarIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { DebtDatesProps } from "@/data/debtDetail";

export default function DebtDates({ debt }: DebtDatesProps) {
	const t = useTranslations();

	const formatDate = (dateString: string) => {
		if (typeof window === "undefined") return dateString;
		return new Date(dateString).toLocaleDateString("es-ES", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const dates = [
		{
			key: "firstPayment",
			value: formatDate(debt.first_payment_date),
		},
		{
			key: "lastPayment",
			value: debt.final_payment_date
				? formatDate(debt.final_payment_date)
				: t("debtDetail.dates.notSpecified"),
		},
	];

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5">
				<h2 className="card-title text-xl mb-4">
					<CalendarIcon className="w-6 h-6" />
					{t("debtDetail.sections.dates")}
				</h2>
				<div className="space-y-5">
					{dates.map(({ key, value }) => (
						<div key={key}>
							<div className="text-base text-base-content/70 mb-2">
								{t(`debtDetail.dates.${key}`)}
							</div>
							<div className="text-lg font-medium">{value}</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
