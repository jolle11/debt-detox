"use client";

import { useLocale, useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import {
	AMOUNT_FORMATS,
	type AmountFormat,
	formatCurrency,
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
	const [amountFormat, setAmountFormat] = useState<AmountFormat>(currentFormat);

	useEffect(() => {
		setAmountFormat((user.amount_format || "automatic") as AmountFormat);
	}, [user]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			successMessage: t("amountFormatUpdated"),
			errorMessage: t("amountFormatError"),
		});

	const reset = () => setAmountFormat(currentFormat);

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
				await handleUpdate({ amount_format: amountFormat });
			}}
			onCancel={() => {
				cancelEditing();
				reset();
			}}
			editButtonText={t("editAmountFormat")}
			displayContent={
				<p className="text-base-content text-lg">
					{t(`amountFormatOptions.${currentFormat}`)} ·{" "}
					{formatCurrency(1234, user.currency || "EUR", locale, currentFormat)}
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
		</ProfileForm>
	);
}
