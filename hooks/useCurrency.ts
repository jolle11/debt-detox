"use client";

import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency as baseFormatCurrency } from "@/lib/format";

export function useCurrency() {
	const { user } = useAuth();
	const locale = useLocale();
	const userCurrency = user?.currency || "EUR";

	const formatCurrency = (value: number): string => {
		return baseFormatCurrency(value, userCurrency, locale);
	};

	return {
		currency: userCurrency,
		formatCurrency,
	};
}
