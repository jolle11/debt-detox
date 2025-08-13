import type { Debt } from "@/lib/mock-data";
import DebtActions from "./debt-actions";
import DebtInfo from "./debt-info";
import DebtProgress from "./debt-progress";

interface DebtCardProps {
	debt: Debt;
}

export default function DebtCard({ debt }: DebtCardProps) {
	return (
		<div
			className={`card bg-base-100 shadow-lg ${debt.status === "completed" ? "opacity-75" : ""}`}
		>
			<div className="card-body">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h3 className="card-title text-lg">{debt.name}</h3>
						<p className="text-sm text-base-content/70 mb-2">
							{debt.entity}
						</p>
						<DebtInfo debt={debt} />
						<DebtProgress debt={debt} />
					</div>
					<DebtActions debt={debt} />
				</div>
			</div>
		</div>
	);
}
