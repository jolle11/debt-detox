"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import {
	AMOUNT_FORMATS,
	type AmountFormat,
	formatCurrency,
	NUMBER_FORMATS,
	type NumberFormat,
	resolveNumberLocale,
} from "@/lib/format";
import ProfileForm from "./ProfileForm";

interface AmountFormatSectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function AmountFormatSection({
	user,
	refreshUser,
}: AmountFormatSectionProps) {
	const t = useTranslations("profile");
	const locale = useLocale();
	const currentFormat = (user.amount_format || "automatic") as AmountFormat;
	const currentNumberFormat = (user.number_format || "locale") as NumberFormat;
	const [amountFormat, setAmountFormat] = useState<AmountFormat>(currentFormat);
	const [numberFormat, setNumberFormat] =
		useState<NumberFormat>(currentNumberFormat);

	useEffect(() => {
		setAmountFormat((user.amount_format || "automatic") as AmountFormat);
		setNumberFormat((user.number_format || "locale") as NumberFormat);
	}, [user]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			successMessage: t("amountFormatUpdated"),
			errorMessage: t("amountFormatError"),
		});

	const reset = () => {
		setAmountFormat(currentFormat);
		setNumberFormat(currentNumberFormat);
	};
	const previewLocale = resolveNumberLocale(locale, numberFormat);
	const currentPreviewLocale = resolveNumberLocale(locale, currentNumberFormat);

	return (
		<ProfileForm
			title={t("amountFormat")}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => {
				reset();
				startEditing();
			}}
			onSubmit={async (event) => {
				event.preventDefault();
				await handleUpdate({
					amount_format: amountFormat,
					number_format: numberFormat,
				});
			}}
			onCancel={() => {
				cancelEditing();
				reset();
			}}
			editButtonText={t("editAmountFormat")}
			displayContent={
				<p className="text-base-content text-lg">
					{t(`numberFormatOptions.${currentNumberFormat}`)} ·{" "}
					{formatCurrency(
						1234.56,
						user.currency || "EUR",
						currentPreviewLocale,
						currentFormat,
					)}
				</p>
			}
		>
			<div className="form-control">
				<label className="label" htmlFor="amount-format">
					<span className="label-text">{t("amountFormat")}</span>
				</label>
				<select
					id="amount-format"
					className="select select-bordered w-full"
					value={amountFormat}
					onChange={(event) =>
						setAmountFormat(event.target.value as AmountFormat)
					}
				>
					{AMOUNT_FORMATS.map((format) => (
						<option key={format} value={format}>
							{t(`amountFormatOptions.${format}`)}
						</option>
					))}
				</select>
			</div>

			<div className="form-control">
				<label className="label" htmlFor="number-format">
					<span className="label-text">{t("numberFormat")}</span>
				</label>
				<select
					id="number-format"
					className="select select-bordered w-full"
					value={numberFormat}
					onChange={(event) =>
						setNumberFormat(event.target.value as NumberFormat)
					}
				>
					{NUMBER_FORMATS.map((format) => (
						<option key={format} value={format}>
							{t(`numberFormatOptions.${format}`)}
						</option>
					))}
				</select>
			</div>

			<div className="rounded-box bg-base-200 p-3 text-sm">
				{t("amountFormatPreview")}:{" "}
				{formatCurrency(
					1234.56,
					user.currency || "EUR",
					previewLocale,
					amountFormat,
				)}
			</div>
		</ProfileForm>
	);
}
