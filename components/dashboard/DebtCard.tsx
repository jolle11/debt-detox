import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { calculateDebtStatus } from "@/lib/format";
import type { Debt, Payment } from "@/lib/types";
import DebtActions from "./DebtActions";
import DebtInfo from "./DebtInfo";
import DebtPaymentStatus from "./DebtPaymentStatus";
import DebtProgressWithPayments from "./DebtProgressWithPayments";

interface DebtCardProps {
	debt: Debt;
	payments: Payment[];
	onEdit?: (debt: Debt) => void;
	onDelete?: (debt: Debt) => void;
	onComplete?: (debt: Debt) => void;
}

export default function DebtCard({
	debt,
	payments,
	onEdit,
	onDelete,
	onComplete,
}: DebtCardProps) {
	const status = calculateDebtStatus(debt.final_payment_date);
	const router = useRouter();
	const debtPayments = useMemo(
		() => payments.filter((p) => p.debt_id === debt.id),
		[payments, debt.id],
	);

	const handleCardClick = () => {
		router.push(`/debt/${debt.id}`);
	};

	return (
		<div
			className={`card bg-base-100 shadow cursor-pointer hover:shadow-lg transition-shadow ${status === "completed" ? "opacity-75" : ""}`}
			onClick={handleCardClick}
		>
			<div className="card-body p-3 sm:p-5 lg:p-6">
				{/* Header: Name + Entity + Actions */}
				<div className="flex justify-between items-start gap-2">
					<div className="flex-1 min-w-0">
						<h3 className="card-title text-base sm:text-xl leading-tight truncate">{debt.name}</h3>
						<p className="text-sm sm:text-base text-base-content/70">{debt.entity}</p>
					</div>
					<div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
						<DebtActions
							debt={debt}
							onEdit={onEdit}
							onDelete={onDelete}
							onComplete={onComplete}
						/>
					</div>
				</div>

				{/* Divider */}
				<div className="divider my-0 sm:my-1" />

				{/* Stats grid */}
				<DebtInfo debt={debt} payments={debtPayments} />

				{/* Progress section */}
				<div className="mt-3 sm:mt-4">
					<DebtProgressWithPayments
						debt={debt}
						payments={debtPayments}
						isLoading={false}
					/>
				</div>

				{/* Payment status — integrated into bottom row on desktop */}
				<div className="mt-2 sm:mt-3 flex items-center justify-between">
					<DebtPaymentStatus debt={debt} payments={debtPayments} />
				</div>
			</div>
		</div>
	);
}
