import { calculateTotalAmount } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import { calculatePaymentStats } from "@/utils/debtCalculations";

export interface ExportLabels {
	title: string;
	generated: string;
	debt: string;
	entity: string;
	period: string;
	type: string;
	installment: string;
	extra: string;
	planned: string;
	paid: string;
	paidDate: string;
	status: string;
	yes: string;
	no: string;
	total: string;
	remaining: string;
	progress: string;
	annualSummary: string;
	year: string;
	installments: string;
	extras: string;
	payments: string;
}

export interface PaymentRow {
	debt: string;
	entity: string;
	period: string;
	isExtra: boolean;
	planned: number;
	actual: number;
	paid: boolean;
	paidDate: string;
}

export interface AnnualSummaryRow {
	year: number;
	installments: number;
	extras: number;
	total: number;
	count: number;
}

export function buildPaymentRows(
	debts: Debt[],
	payments: Payment[],
): PaymentRow[] {
	const byId = new Map(debts.map((debt) => [debt.id, debt]));
	return payments
		.filter((payment) => !payment.deleted && byId.has(payment.debt_id))
		.map((payment) => {
			const debt = byId.get(payment.debt_id) as Debt;
			return {
				debt: debt.name,
				entity: debt.entity,
				period: `${payment.year}-${String(payment.month).padStart(2, "0")}`,
				isExtra: Boolean(payment.is_extra_payment),
				planned: payment.planned_amount || 0,
				actual: payment.paid
					? payment.actual_amount || payment.planned_amount
					: 0,
				paid: payment.paid,
				paidDate: payment.paid_date?.slice(0, 10) ?? "",
			};
		})
		.sort(
			(a, b) =>
				a.debt.localeCompare(b.debt) ||
				a.period.localeCompare(b.period) ||
				Number(a.isExtra) - Number(b.isExtra),
		);
}

export function buildAnnualSummary(rows: PaymentRow[]): AnnualSummaryRow[] {
	const years = new Map<number, AnnualSummaryRow>();
	for (const row of rows) {
		if (!row.paid) continue;
		const year = Number((row.paidDate || row.period).slice(0, 4));
		const entry = years.get(year) ?? {
			year,
			installments: 0,
			extras: 0,
			total: 0,
			count: 0,
		};
		if (row.isExtra) entry.extras += row.actual;
		else entry.installments += row.actual;
		entry.total += row.actual;
		entry.count += 1;
		years.set(year, entry);
	}
	return [...years.values()].sort((a, b) => a.year - b.year);
}

function csvCell(value: string | number) {
	const text = String(value);
	return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function buildPaymentsCsv(
	rows: PaymentRow[],
	labels: ExportLabels,
): string {
	const header = [
		labels.debt,
		labels.entity,
		labels.period,
		labels.type,
		labels.planned,
		labels.paid,
		labels.status,
		labels.paidDate,
	];
	const lines = rows.map((row) =>
		[
			row.debt,
			row.entity,
			row.period,
			row.isExtra ? labels.extra : labels.installment,
			row.planned.toFixed(2),
			row.actual.toFixed(2),
			row.paid ? labels.yes : labels.no,
			row.paidDate,
		]
			.map(csvCell)
			.join(","),
	);
	// The BOM makes Excel open accented names as UTF-8.
	return `﻿${[header.map(csvCell).join(","), ...lines].join("\r\n")}`;
}

export function downloadFile(
	content: string,
	filename: string,
	type = "text/csv;charset=utf-8",
) {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	setTimeout(() => URL.revokeObjectURL(url), 0);
}

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

export function buildReportHtml(
	debts: Debt[],
	payments: Payment[],
	labels: ExportLabels,
	formatCurrency: (amount: number) => string,
	locale: string,
): string {
	const rows = buildPaymentRows(debts, payments);
	const summary = buildAnnualSummary(rows);
	const money = (value: number) => escapeHtml(formatCurrency(value));

	const debtRows = debts
		.map((debt) => {
			const stats = calculatePaymentStats(
				debt,
				payments.filter((payment) => payment.debt_id === debt.id),
			);
			const total = calculateTotalAmount(debt);
			const progress =
				total > 0 ? Math.round((stats.effectivePaidAmount / total) * 100) : 0;
			return `<tr><td>${escapeHtml(debt.name)}</td><td>${escapeHtml(debt.entity)}</td><td class="n">${money(total)}</td><td class="n">${money(stats.pendingAmount)}</td><td class="n">${progress}%</td></tr>`;
		})
		.join("");

	const summaryRows = summary
		.map(
			(row) =>
				`<tr><td>${row.year}</td><td class="n">${row.count}</td><td class="n">${money(row.installments)}</td><td class="n">${money(row.extras)}</td><td class="n">${money(row.total)}</td></tr>`,
		)
		.join("");

	const paymentRows = rows
		.filter((row) => row.paid)
		.map(
			(row) =>
				`<tr><td>${escapeHtml(row.debt)}</td><td>${row.period}</td><td>${row.isExtra ? labels.extra : labels.installment}</td><td class="n">${money(row.actual)}</td><td>${row.paidDate}</td></tr>`,
		)
		.join("");

	const generated = new Date().toLocaleDateString(locale, {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return `<!doctype html><html lang="${escapeHtml(locale)}"><head><meta charset="utf-8"><title>${escapeHtml(labels.title)}</title><style>
body{font-family:system-ui,sans-serif;color:#1f2937;margin:32px;font-size:12px}
h1{font-size:20px;margin:0 0 4px}h2{font-size:14px;margin:24px 0 8px}
p{color:#6b7280;margin:0}table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e5e7eb}
th{font-weight:600;color:#6b7280;font-size:11px;text-transform:uppercase}
.n{text-align:right;font-variant-numeric:tabular-nums}tr{break-inside:avoid}
</style></head><body>
<h1>${escapeHtml(labels.title)}</h1><p>${escapeHtml(labels.generated)} ${escapeHtml(generated)}</p>
<h2>${escapeHtml(labels.debt)}</h2><table><thead><tr><th>${labels.debt}</th><th>${labels.entity}</th><th class="n">${labels.total}</th><th class="n">${labels.remaining}</th><th class="n">${labels.progress}</th></tr></thead><tbody>${debtRows}</tbody></table>
<h2>${escapeHtml(labels.annualSummary)}</h2><table><thead><tr><th>${labels.year}</th><th class="n">${labels.payments}</th><th class="n">${labels.installments}</th><th class="n">${labels.extras}</th><th class="n">${labels.total}</th></tr></thead><tbody>${summaryRows}</tbody></table>
<h2>${escapeHtml(labels.payments)}</h2><table><thead><tr><th>${labels.debt}</th><th>${labels.period}</th><th>${labels.type}</th><th class="n">${labels.paid}</th><th>${labels.paidDate}</th></tr></thead><tbody>${paymentRows}</tbody></table>
</body></html>`;
}

/** Prints the report through a hidden iframe so the browser can save it as PDF. */
export function printReport(html: string) {
	const frame = document.createElement("iframe");
	frame.style.position = "fixed";
	frame.style.width = "0";
	frame.style.height = "0";
	frame.style.border = "0";
	frame.srcdoc = html;
	frame.onload = () => {
		const view = frame.contentWindow;
		if (!view) return frame.remove();
		view.addEventListener("afterprint", () => frame.remove());
		view.focus();
		view.print();
	};
	document.body.appendChild(frame);
}
