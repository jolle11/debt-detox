"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import { CURRENCIES } from "@/lib/currencies";
import ProfileForm from "./ProfileForm";

interface CurrencySectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
}

export default function CurrencySection({
	user,
	refreshUser,
}: CurrencySectionProps) {
	const t = useTranslations("profile");

	const [currency, setCurrency] = useState(user?.currency || "EUR");

	useEffect(() => {
		if (user) {
			setCurrency(user.currency || "EUR");
		}
	}, [user]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			successMessage: t("currencyUpdated"),
			errorMessage: t("currencyError"),
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleUpdate({ currency });
	};

	const currentCurrency = CURRENCIES.find(
		(c) => c.code === (user?.currency || "EUR"),
	);

	return (
		<ProfileForm
			title={t("currency")}
			isEditing={isEditing}
			loading={loading}
			onEdit={() => {
				setCurrency(user?.currency || "EUR");
				startEditing();
			}}
			onSubmit={handleSubmit}
			onCancel={() => {
				cancelEditing();
				setCurrency(user?.currency || "EUR");
			}}
			editButtonText={t("editCurrency")}
			displayContent={
				<div>
					<p className="text-base-content text-lg">
						{currentCurrency
							? `${currentCurrency.name} (${currentCurrency.symbol})`
							: "Euro (€)"}
					</p>
				</div>
			}
		>
			<div className="form-control">
				<label className="label">
					<span className="label-text">{t("currency")}</span>
				</label>
				<select
					className="select select-bordered w-full"
					value={currency}
					onChange={(e) => setCurrency(e.target.value)}
				>
					{CURRENCIES.map((curr) => (
						<option key={curr.code} value={curr.code}>
							{curr.name} ({curr.symbol})
						</option>
					))}
				</select>
			</div>
		</ProfileForm>
	);
}
