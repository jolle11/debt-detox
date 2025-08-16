import { useTranslations } from "next-intl";
import { calculateDebtStatus, calculateProgress } from "@/lib/format";
import type { Debt } from "@/lib/types";

interface DebtProgressProps {
	debt: Debt;
}

export default function DebtProgress({ debt }: DebtProgressProps) {
	const t = useTranslations();
	const progress = calculateProgress(debt.start_date, debt.end_date);
	const status = calculateDebtStatus(debt.end_date);

	return (
		<div className="mt-4">
			<div className="flex justify-between text-sm mb-1">
				<span>{t("dashboard.debt.progress")}</span>
				<span>{progress}%</span>
			</div>
			<progress
				className={`progress ${
					status === "completed"
						? "progress-success"
						: "progress-primary"
				} w-full`}
				value={progress}
				max="100"
			/>
		</div>
	);
}
