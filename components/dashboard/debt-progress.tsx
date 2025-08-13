import { useTranslations } from "next-intl";
import type { Debt } from "@/lib/mock-data";

interface DebtProgressProps {
	debt: Debt;
}

export default function DebtProgress({ debt }: DebtProgressProps) {
	const t = useTranslations();

	return (
		<div className="mt-4">
			<div className="flex justify-between text-sm mb-1">
				<span>{t("dashboard.debt.progress")}</span>
				<span>{debt.progress}%</span>
			</div>
			<progress
				className={`progress ${
					debt.status === "completed"
						? "progress-success"
						: "progress-primary"
				} w-full`}
				value={debt.progress}
				max="100"
			/>
		</div>
	);
}
