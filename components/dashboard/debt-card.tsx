import { useRouter } from "next/navigation";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import DebtActions from "./debt-actions";
import DebtInfo from "./debt-info";
import DebtPaymentStatus from "./debt-payment-status";
import DebtProgressWithPayments from "./debt-progress-with-payments";

interface DebtCardProps {
	debt: Debt;
	payments: Payment[];
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
}

export default function DebtCard({
	debt,
	payments,
	onEdit,
	onDelete,
}: DebtCardProps) {
	const status = calculateDebtStatus(debt.final_payment_date);
	const router = useRouter();

	const handleCardClick = () => {
		router.push(`/debt/${debt.id}`);
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
							<DebtPaymentStatus
								debt={debt}
								payments={payments.filter(
									(p) => p.debt_id === debt.id,
								)}
							/>
						</div>
					</div>
					<div onClick={(e) => e.stopPropagation()}>
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
