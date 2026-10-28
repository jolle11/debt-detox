"use client";

import { PiggyBankIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import PrivateAmount from "@/components/ui/PrivateAmount";
import type { DebtPaymentDetailsProps } from "@/data/debtDetail";
import { normalizeDateOnlyString } from "@/lib/dateOnly";
import { resolveFinalPaymentDate } from "@/lib/debtDates";
import { calculateSavingsPlan } from "@/lib/simulator";

interface StoredSavings {
	goal: string;
	saved: string;
	targetDate: string;
}

// Savings are a personal planning aid, so they stay on this device.
const storageKey = (debtId: string) => `debt-detox:savings:${debtId}`;

function parseAmount(value: string) {
	const amount = Number.parseFloat(value.replace(",", "."));
	return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

export default function DebtSavingsCalculator({
	debt,
	paymentStats,
	formatCurrency,
}: DebtPaymentDetailsProps) {
	const t = useTranslations("debtDetail.savings");
	const hasFinalPayment = (debt.final_payment ?? 0) > 0;
	const defaults: StoredSavings = {
		goal: String(
			hasFinalPayment ? debt.final_payment : paymentStats.pendingAmount,
		),
		saved: "",
		targetDate: normalizeDateOnlyString(resolveFinalPaymentDate(debt)),
	};
	const [values, setValues] = useState<StoredSavings>(defaults);
	const [loadedFor, setLoadedFor] = useState<string | null>(null);

	useEffect(() => {
		if (!debt.id) return;
		try {
			const stored = localStorage.getItem(storageKey(debt.id));
			if (stored)
				setValues((current) => ({ ...current, ...JSON.parse(stored) }));
		} catch {
			// Corrupt or unavailable storage falls back to the defaults.
		}
		setLoadedFor(debt.id);
	}, [debt.id]);

	useEffect(() => {
		if (!debt.id || loadedFor !== debt.id) return;
		try {
			localStorage.setItem(storageKey(debt.id), JSON.stringify(values));
		} catch {
			// Storage may be full or disabled; the calculator still works.
		}
	}, [debt.id, loadedFor, values]);

	if (debt.completed_at) return null;

	const plan = calculateSavingsPlan(
		parseAmount(values.goal),
		parseAmount(values.saved),
		values.targetDate,
	);
	const update =
		(field: keyof StoredSavings) =>
		(event: React.ChangeEvent<HTMLInputElement>) =>
			setValues((current) => ({ ...current, [field]: event.target.value }));

	return (
		<div className="card bg-base-100 shadow">
			<div className="card-body p-5 gap-4">
				<div>
					<h2 className="card-title text-xl">
						<PiggyBankIcon className="w-6 h-6" />
						{t("title")}
					</h2>
					<p className="text-sm text-base-content/60">
						{hasFinalPayment ? t("descriptionFinal") : t("description")}
					</p>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<label className="form-control col-span-2">
						<span className="label-text mb-1">{t("goal")}</span>
						<input
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							className="input input-bordered input-sm w-full"
							value={values.goal}
							onChange={update("goal")}
						/>
					</label>
					<label className="form-control">
						<span className="label-text mb-1">{t("saved")}</span>
						<input
							type="number"
							inputMode="decimal"
							min="0"
							step="0.01"
							className="input input-bordered input-sm w-full"
							value={values.saved}
							onChange={update("saved")}
							placeholder="0"
						/>
					</label>
					<label className="form-control">
						<span className="label-text mb-1">{t("targetDate")}</span>
						<input
							type="date"
							className="input input-bordered input-sm w-full"
							value={values.targetDate}
							onChange={update("targetDate")}
						/>
					</label>
				</div>

				<div>
					<div className="flex justify-between text-sm mb-1">
						<span className="text-base-content/70">{t("progress")}</span>
						<span className="font-medium">{plan.progress}%</span>
					</div>
					<progress
						className="progress progress-success w-full"
						value={plan.progress}
						max={100}
						aria-label={t("progress")}
					/>
				</div>

				<div className="rounded-lg bg-base-200 p-3 text-sm space-y-1">
					{plan.remaining === 0 ? (
						<div className="text-success font-medium">{t("reached")}</div>
					) : (
						<>
							<div className="flex justify-between gap-2">
								<span className="text-base-content/70">
									{t("monthlyNeeded")}
								</span>
								<span className="font-semibold">
									<PrivateAmount>
										{formatCurrency(plan.monthlyNeeded)}
									</PrivateAmount>
								</span>
							</div>
							<div className="flex justify-between gap-2">
								<span className="text-base-content/70">{t("stillToSave")}</span>
								<span>
									<PrivateAmount>
										{formatCurrency(plan.remaining)}
									</PrivateAmount>
								</span>
							</div>
							<div className="text-base-content/60">
								{t("monthsLeft", { count: plan.monthsLeft })}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
