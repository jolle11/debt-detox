import DebtActions from "@/components/dashboard/debt-actions";
import DebtInfo from "@/components/dashboard/debt-info";
import DebtProgressWithPayments from "@/components/dashboard/debt-progress-with-payments";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import DemoDebtPaymentStatus from "./DemoDebtPaymentStatus";

interface DemoDebtCardProps {
	debt: Debt;
	payments: Payment[];
	onDebtClick: (debt: Debt) => void;
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
}

export default function DemoDebtCard({
	debt,
	payments,
	onDebtClick,
	onEdit,
	onDelete,
}: DemoDebtCardProps) {
	const status = calculateDebtStatus(debt.final_payment_date);

	const handleCardClick = () => {
		onDebtClick(debt);
	};

	return (
		<div
			className={`card bg-base-100 shadow cursor-pointer hover:shadow-lg transition-shadow ${status === "completed" ? "opacity-75" : ""}`}
			onClick={handleCardClick}
		>
			<div className="card-body p-5">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						<h3 className="card-title text-xl">{debt.name}</h3>
						<p className="text-base text-base-content/70 mb-2">
							{debt.entity}
						</p>
						<DebtInfo debt={debt} />
						<div className="mt-4">
							<DebtProgressWithPayments
								debt={debt}
								payments={payments.filter(
									(p) => p.debt_id === debt.id,
								)}
								isLoading={false}
							/>
						</div>
						<div className="mt-3">
							<DemoDebtPaymentStatus
								debt={debt}
								payments={payments.filter(
									(p) => p.debt_id === debt.id,
								)}
							/>
						</div>
					</div>
					<div className="ml-4">
						<DebtActions
							debt={debt}
							onEdit={onEdit}
							onDelete={onDelete}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
