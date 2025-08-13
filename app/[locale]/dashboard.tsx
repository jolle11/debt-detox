"use client";
import { useTranslations, useLocale } from "next-intl";
import { mockDebts } from "@/lib/mock-data";
import SummaryStats from "@/components/dashboard/summary-stats";
import DebtsList from "@/components/dashboard/debts-list";

export default function Dashboard() {
	const t = useTranslations();
	const locale = useLocale();

	const debts = mockDebts;

	return (
		<div className="space-y-6">
			{/* Summary Cards */}
			<SummaryStats debts={debts} />

			{/* Debt List */}
			<DebtsList debts={debts} />
		</div>
	);
}
