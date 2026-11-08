"use client";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import PrivateAmount from "@/components/ui/PrivateAmount";
import { useAuth } from "@/contexts/AuthContext";
import { useCollaboration } from "@/hooks/useCollaboration";
import { useCurrency } from "@/hooks/useCurrency";
import type { Debt } from "@/lib/types";
import { percentagesFromIncomes } from "@/utils/debtCalculations";

interface Row {
	key: number;
	user_id?: string;
	name: string;
	percent: string;
	income: string;
}

export default function SplitEditor({
	debt,
	onClose,
}: {
	debt: Debt;
	onClose: () => void;
}) {
	const t = useTranslations("collaboration");
	const { user } = useAuth();
	const { formatCurrency } = useCurrency();
	const { saveSplit, isSaving } = useCollaboration(debt.id);
	const [useIncomes, setUseIncomes] = useState(false);
	const [rows, setRows] = useState<Row[]>(() => {
		const people = debt.participants?.length
			? debt.participants
			: [
					{ user_id: user?.id, name: "", percent: 50 },
					{ name: "", percent: 50 },
				];
		return people.map((person, key) => ({
			key,
			user_id: person.user_id || undefined,
			name: person.name,
			percent: String(person.percent),
			income: "",
		}));
	});

	const update = (key: number, change: Partial<Row>) =>
		setRows((current) =>
			current.map((row) => (row.key === key ? { ...row, ...change } : row)),
		);
	const total =
		Math.round(rows.reduce((sum, row) => sum + Number(row.percent), 0) * 100) /
		100;
	const incomes = rows.map((row) => Number(row.income));
	const valid =
		total === 100 &&
		rows.every(
			(row) => Number(row.percent) > 0 && (row.user_id || row.name.trim()),
		);

	const applyIncomes = () => {
		const percents = percentagesFromIncomes(incomes);
		if (!percents) return;
		setRows((current) =>
			current.map((row, index) => ({
				...row,
				percent: String(percents[index]),
			})),
		);
	};

	const save = async () => {
		try {
			await saveSplit(
				rows.map((row) => ({
					user_id: row.user_id,
					name: row.name.trim(),
					percent: Number(row.percent),
				})),
			);
			toast.success(t("split.saved"));
			onClose();
		} catch {
			toast.error(t("split.error"));
		}
	};

	return (
		<div className="space-y-3">
			<div>
				<p className="font-medium">{t("split.title")}</p>
				<p className="text-sm text-base-content/60">{t("split.help")}</p>
			</div>

			<ul className="space-y-2">
				{rows.map((row) => {
					const linked = Boolean(row.user_id);
					return (
						<li key={row.key} className="flex flex-wrap items-center gap-2">
							{linked ? (
								<span className="min-w-28 flex-1 truncate">
									{row.user_id === user?.id
										? t("split.you")
										: row.name || t("member")}
								</span>
							) : (
								<input
									type="text"
									className="input input-bordered input-sm min-w-28 flex-1"
									aria-label={t("split.guestName")}
									placeholder={t("split.guestName")}
									maxLength={100}
									value={row.name}
									onChange={(e) => update(row.key, { name: e.target.value })}
								/>
							)}
							{useIncomes && (
								<input
									type="number"
									min="0"
									step="0.01"
									className="input input-bordered input-sm w-28"
									aria-label={t("split.income")}
									placeholder={t("split.income")}
									value={row.income}
									onChange={(e) => update(row.key, { income: e.target.value })}
								/>
							)}
							<label className="input input-bordered input-sm w-24">
								<input
									type="number"
									min="0.01"
									max="100"
									step="0.01"
									aria-label={`${row.name || t("split.you")} %`}
									value={row.percent}
									onChange={(e) => update(row.key, { percent: e.target.value })}
								/>
								<span className="text-base-content/50">%</span>
							</label>
							<span className="w-20 text-right text-sm tabular-nums text-base-content/70">
								<PrivateAmount>
									{formatCurrency(
										(debt.monthly_amount * (Number(row.percent) || 0)) / 100,
									)}
								</PrivateAmount>
							</span>
							<button
								type="button"
								className="btn btn-ghost btn-sm btn-square"
								aria-label={t("split.remove")}
								disabled={linked}
								onClick={() =>
									setRows((current) =>
										current.filter((other) => other.key !== row.key),
									)
								}
							>
								{!linked && <TrashIcon size={16} />}
							</button>
						</li>
					);
				})}
			</ul>

			<div className="flex flex-wrap items-center justify-between gap-2">
				<button
					type="button"
					className="btn btn-ghost btn-sm"
					onClick={() =>
						setRows((current) => [
							...current,
							{
								key: Math.max(...current.map((row) => row.key)) + 1,
								name: "",
								percent: "",
								income: "",
							},
						])
					}
				>
					<PlusIcon size={16} />
					{t("split.addGuest")}
				</button>
				<span
					className={`text-sm font-medium ${total === 100 ? "" : "text-error"}`}
				>
					{t("split.total", { total })}
				</span>
			</div>
			{total !== 100 && (
				<p role="alert" className="text-sm text-error">
					{t("split.mustTotal")}
				</p>
			)}

			<div className="rounded-lg border border-base-300 p-3 space-y-2">
				<label className="flex items-center gap-2 text-sm cursor-pointer">
					<input
						type="checkbox"
						className="checkbox checkbox-sm"
						checked={useIncomes}
						onChange={(e) => setUseIncomes(e.target.checked)}
					/>
					{t("split.useIncomes")}
				</label>
				{useIncomes && (
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="text-sm text-base-content/60">
							{t("split.incomesPrivate")}
						</span>
						<button
							type="button"
							className="btn btn-outline btn-sm"
							disabled={!percentagesFromIncomes(incomes)}
							onClick={applyIncomes}
						>
							{t("split.apply")}
						</button>
					</div>
				)}
			</div>

			<div className="flex justify-end gap-2">
				<button
					type="button"
					className="btn btn-ghost btn-sm"
					onClick={onClose}
				>
					{t("split.cancel")}
				</button>
				<button
					type="button"
					className="btn btn-primary btn-sm"
					disabled={!valid || isSaving}
					onClick={save}
				>
					{t("split.save")}
				</button>
			</div>
		</div>
	);
}
