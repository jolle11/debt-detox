"use client";

import { DownloadSimpleIcon, SignOutIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/routing";
import pb from "@/lib/pocketbase";
import { COLLECTIONS } from "@/lib/types";
import SettingRow from "./SettingRow";

interface AccountSectionProps {
	user: RecordModel;
}

const EXPORT_FIELDS = [
	"name",
	"entity",
	"down_payment",
	"monthly_amount",
	"number_of_payments",
	"first_payment_date",
	"final_payment",
	"final_payment_date",
	"completed_at",
	"is_shared",
	"created",
] as const;

const toCsvValue = (value: unknown) => {
	const text = value == null ? "" : String(value);
	return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const download = (content: string, type: string, filename: string) => {
	const url = URL.createObjectURL(new Blob([content], { type }));
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
};

export default function AccountSection({ user }: AccountSectionProps) {
	const t = useTranslations("profile");
	const ta = useTranslations("auth");
	const { logout } = useAuth();
	const router = useRouter();
	const [exporting, setExporting] = useState(false);

	const exportData = async (format: "json" | "csv") => {
		setExporting(true);
		try {
			const debts = await pb.collection(COLLECTIONS.DEBTS).getFullList({
				filter: pb.filter("deleted = null && user_id = {:userId}", {
					userId: user.id,
				}),
				sort: "-created",
			});
			const payments = await pb.collection(COLLECTIONS.PAYMENTS).getFullList({
				filter: pb.filter("debt_id.user_id = {:userId}", { userId: user.id }),
			});
			const date = new Date().toISOString().slice(0, 10);

			if (format === "json") {
				const data = debts.map((debt) => ({
					...debt,
					payments: payments.filter((p) => p.debt_id === debt.id),
				}));
				download(
					JSON.stringify(data, null, 4),
					"application/json",
					`debt-detox-${date}.json`,
				);
			} else {
				const rows = debts.map((debt) =>
					EXPORT_FIELDS.map((field) => toCsvValue(debt[field])).join(","),
				);
				download(
					[EXPORT_FIELDS.join(","), ...rows].join("\n"),
					"text/csv;charset=utf-8",
					`debt-detox-${date}.csv`,
				);
			}
		} catch {
			toast.error(t("exportError"));
		} finally {
			setExporting(false);
		}
	};

	return (
		<>
			<SettingRow label={t("exportData")} description={t("exportDescription")}>
				<div className="join">
					{(["csv", "json"] as const).map((format) => (
						<button
							key={format}
							type="button"
							className="btn btn-outline btn-sm join-item"
							disabled={exporting}
							onClick={() => exportData(format)}
						>
							{format === "csv" && <DownloadSimpleIcon size={16} />}
							{format.toUpperCase()}
						</button>
					))}
				</div>
			</SettingRow>
			<SettingRow label={ta("logout")}>
				<button
					type="button"
					className="btn btn-outline btn-sm"
					onClick={() => {
						logout();
						router.push("/");
					}}
				>
					<SignOutIcon size={16} />
					{t("signOut")}
				</button>
			</SettingRow>
		</>
	);
}
