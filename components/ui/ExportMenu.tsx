"use client";

import {
	DownloadSimpleIcon,
	FileCsvIcon,
	FilePdfIcon,
} from "@phosphor-icons/react";
import { useLocale, useTranslations } from "next-intl";
import { useCurrency } from "@/hooks/useCurrency";
import {
	buildPaymentRows,
	buildPaymentsCsv,
	buildReportHtml,
	downloadFile,
	type ExportLabels,
	printReport,
} from "@/lib/exportDebts";
import type { Debt, Payment } from "@/lib/types";

interface ExportMenuProps {
	debts: Debt[];
	payments: Payment[];
	filename: string;
	title: string;
	className?: string;
}

const LABEL_KEYS = [
	"generated",
	"debt",
	"entity",
	"period",
	"type",
	"installment",
	"extra",
	"planned",
	"paid",
	"paidDate",
	"status",
	"yes",
	"no",
	"total",
	"remaining",
	"progress",
	"annualSummary",
	"year",
	"installments",
	"extras",
	"payments",
] as const;

export default function ExportMenu({
	debts,
	payments,
	filename,
	title,
	className = "",
}: ExportMenuProps) {
	const t = useTranslations("export");
	const locale = useLocale();
	const { formatCurrency } = useCurrency();

	const labels = () =>
		Object.fromEntries([
			["title", title],
			...LABEL_KEYS.map((key) => [key, t(`labels.${key}`)]),
		]) as ExportLabels;

	const exportCsv = () =>
		downloadFile(
			buildPaymentsCsv(buildPaymentRows(debts, payments), labels()),
			`${filename}.csv`,
		);
	const exportPdf = () =>
		printReport(
			buildReportHtml(debts, payments, labels(), formatCurrency, locale),
		);

	return (
		<div className={`dropdown dropdown-end ${className}`}>
			<button type="button" tabIndex={0} className="btn btn-ghost btn-sm">
				<DownloadSimpleIcon className="w-4 h-4" />
				{t("button")}
			</button>
			<ul className="menu dropdown-content bg-base-100 rounded-box z-10 w-48 p-2 shadow border border-base-300">
				<li>
					<button type="button" onClick={exportCsv}>
						<FileCsvIcon className="w-4 h-4" />
						{t("csv")}
					</button>
				</li>
				<li>
					<button type="button" onClick={exportPdf}>
						<FilePdfIcon className="w-4 h-4" />
						{t("pdf")}
					</button>
				</li>
			</ul>
		</div>
	);
}
