"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { CURRENCIES } from "@/lib/currencies";
import {
	AMOUNT_FORMATS,
	type AmountFormat,
	formatCurrency,
	NUMBER_FORMATS,
	type NumberFormat,
	resolveNumberLocale,
} from "@/lib/format";
import PrivacySection from "./PrivacySection";
import SettingRow from "./SettingRow";

interface PreferencesSectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function PreferencesSection({
	user,
	refreshUser,
}: PreferencesSectionProps) {
	const t = useTranslations("profile");
	const tp = useTranslations("privacy");
	const locale = useLocale();
	const currency = user.currency || "EUR";
	const amountFormat = (user.amount_format || "automatic") as AmountFormat;
	const numberFormat = (user.number_format || "locale") as NumberFormat;

	const { loading, handleUpdate } = useProfileUpdate({
		user,
		refreshUser,
		successMessage: t("saved"),
		errorMessage: t("updateError"),
	});

	const preview =
		user.hide_amounts === true
			? "•••••"
			: formatCurrency(
					1234.56,
					currency,
					resolveNumberLocale(locale, numberFormat),
					amountFormat,
				);

	return (
		<>
			<SettingRow label={t("currency")} htmlFor="profile-currency">
				<select
					id="profile-currency"
					className="select select-bordered select-sm w-44"
					value={currency}
					disabled={loading}
					onChange={(e) => handleUpdate({ currency: e.target.value })}
				>
					{CURRENCIES.map((curr) => (
						<option key={curr.code} value={curr.code}>
							{curr.code} — {curr.name}
						</option>
					))}
				</select>
			</SettingRow>
			<SettingRow label={t("numberFormat")} labelId="profile-number-format">
				<fieldset className="join" aria-labelledby="profile-number-format">
					{NUMBER_FORMATS.map((format) => (
						<input
							key={format}
							type="radio"
							name="profile-number-format"
							className="btn btn-sm join-item checked:btn-primary"
							aria-label={
								format === "locale"
									? t("numberFormatShort")
									: t(`numberFormatOptions.${format}`)
							}
							checked={numberFormat === format}
							disabled={loading}
							onChange={() => handleUpdate({ number_format: format })}
						/>
					))}
				</fieldset>
			</SettingRow>
			<SettingRow label={t("amountFormat")} htmlFor="profile-amount-format">
				<select
					id="profile-amount-format"
					className="select select-bordered select-sm w-44"
					value={amountFormat}
					disabled={loading}
					onChange={(e) => handleUpdate({ amount_format: e.target.value })}
				>
					{AMOUNT_FORMATS.map((format) => (
						<option key={format} value={format}>
							{t(`amountFormatOptions.${format}`)}
						</option>
					))}
				</select>
			</SettingRow>
			<PrivacySection />
			<div
				className="mt-2 flex items-center justify-between gap-3 rounded-box bg-primary/10 p-3"
				aria-live="polite"
			>
				<span className="text-sm">{t("amountFormatPreview")}</span>
				<span className="font-mono text-lg font-semibold">
					{user.hide_amounts === true ? (
						<>
							<span aria-hidden="true">{preview}</span>
							<span className="sr-only">{tp("hiddenAmount")}</span>
						</>
					) : (
						preview
					)}
				</span>
			</div>
		</>
	);
}
