"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { toast } from "sonner";
import {
	DEBT_SORT_KEYS,
	DEFAULT_SORT_DIRECTIONS,
	type DebtSortKey,
	type DebtSortPreference,
	type SortDirection,
} from "@/lib/debtSorting";

interface DebtSortControlProps {
	preference: DebtSortPreference;
	isSaving: boolean;
	onChange: (preference: DebtSortPreference) => Promise<void>;
}

export default function DebtSortControl({
	preference,
	isSaving,
	onChange,
}: DebtSortControlProps) {
	const t = useTranslations("debtSort");
	const id = useId();
	const save = async (next: DebtSortPreference) => {
		try {
			await onChange(next);
		} catch {
			toast.error(t("saveError"));
		}
	};
	return (
		<div
			className="mb-4 flex w-full flex-wrap items-center gap-2 lg:mb-6 lg:w-auto"
			aria-busy={isSaving}
		>
			<label htmlFor={id} className="w-full text-sm text-base-content/70 sm:w-auto">
				{t("label")}
			</label>
			<div className="grid w-full min-w-0 grid-cols-1 gap-2 min-[420px]:grid-cols-2 sm:flex sm:w-auto sm:flex-1 lg:flex-none">
				<select
					id={id}
					className="select select-bordered select-sm w-full min-w-0 sm:flex-1 lg:w-52"
					value={preference.by}
					disabled={isSaving}
					onChange={(event) => {
						const by = event.target.value as DebtSortKey;
						void save({ by, direction: DEFAULT_SORT_DIRECTIONS[by] });
					}}
				>
					{DEBT_SORT_KEYS.map((key) => (
						<option key={key} value={key}>
							{t(`criteria.${key}`)}
						</option>
					))}
				</select>
				<select
					className="select select-bordered select-sm w-full min-w-0 sm:w-44 sm:shrink-0"
					aria-label={t("direction")}
					value={preference.direction}
					disabled={isSaving}
					onChange={(event) =>
						void save({
							...preference,
							direction: event.target.value as SortDirection,
						})
					}
				>
					<option value="asc">{t(`directions.${preference.by}.asc`)}</option>
					<option value="desc">{t(`directions.${preference.by}.desc`)}</option>
				</select>
			</div>
			{isSaving && (
				<span
					role="status"
					className="loading loading-spinner loading-xs"
					aria-label={t("saving")}
				/>
			)}
		</div>
	);
}
