"use client";

import { useTranslations } from "next-intl";
import type { RecordModel } from "pocketbase";
import { useEffect, useState } from "react";
import { useProfileUpdate } from "@/hooks/useProfileUpdate";
import ProfileForm from "./ProfileForm";

interface CurrencySectionProps {
	user: RecordModel;
	refreshUser: () => Promise<void>;
	onMessage: (message: { type: string; text: string }) => void;
}

import { CURRENCIES } from "@/lib/currencies";

export default function CurrencySection({
	user,
	refreshUser,
	onMessage,
}: CurrencySectionProps) {
	const t = useTranslations("profile");

	const [formData, setFormData] = useState({
		currency: user?.currency || "EUR",
	});

	useEffect(() => {
		if (user) {
			setFormData({
				currency: user.currency || "EUR",
			});
		}
	}, [user]);

	const { isEditing, loading, handleUpdate, startEditing, cancelEditing } =
		useProfileUpdate({
			user,
			refreshUser,
			onMessage,
			successMessage: t("currencyUpdated"),
			errorMessage: t("currencyError"),
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		await handleUpdate({ currency: formData.currency });
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
				setFormData({ currency: user?.currency || "EUR" });
				startEditing();
			}}
			onSubmit={handleSubmit}
			onCancel={() => {
				cancelEditing();
				setFormData({ currency: user?.currency || "EUR" });
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
					value={formData.currency}
					onChange={(e) =>
						setFormData({
							...formData,
							currency: e.target.value,
						})
					}
				>
					{CURRENCIES.map((currency) => (
						<option key={currency.code} value={currency.code}>
							{currency.name} ({currency.symbol})
						</option>
					))}
				</select>
			</div>
		</ProfileForm>
	);
}
