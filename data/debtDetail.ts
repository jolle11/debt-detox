import type { Debt, Payment } from "@/lib/types";

export interface PaymentStats {
	registeredPaidPayments: number;
	expectedPaidPayments: number;
	effectivePaidPayments: number;
	effectivePaidAmount: number;
	totalRegisteredAmount: number;
	pendingPayments: number;
	pendingAmount: number;
}

export interface DebtDetailProps {
	debt: Debt;
	payments: Payment[];
	formatCurrency: (amount: number) => string;
	isLoading?: boolean;
}

export interface DebtHeaderProps extends DebtDetailProps {
	onEdit: () => void;
	onDelete: () => void;
	onComplete: () => void;
	onBack: () => void;
}

export interface DebtStatsProps extends DebtDetailProps {
	paymentStats: PaymentStats;
	totalAmount: number;
}

export interface DebtPaymentDetailsProps extends DebtDetailProps {
	paymentStats: PaymentStats;
}

export interface DebtStructureProps extends DebtDetailProps {
	totalAmount: number;
}

export interface DebtDatesProps extends DebtDetailProps {}

export interface DebtProductImageProps extends DebtDetailProps {}

export const debtStatusConfig = {
	completed: {
		badge: "badge-success",
		key: "debtDetail.status.completed",
	},
	active: {
		badge: "badge-primary",
		key: "debtDetail.status.active",
	},
	pending: {
		badge: "badge-warning",
		key: "debtDetail.status.pending",
	},
} as const;
