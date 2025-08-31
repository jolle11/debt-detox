"use client";

import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency as baseFormatCurrency } from "@/lib/format";

export function useCurrency() {
	const { user } = useAuth();
	const userCurrency = user?.currency || "EUR";

	const formatCurrency = (value: number): string => {
		return baseFormatCurrency(value, userCurrency);
	};

	return {
		currency: userCurrency,
		formatCurrency,
	};
}