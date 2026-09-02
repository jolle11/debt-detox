"use client";

import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import {
	type AmountFormat,
	formatCurrency as baseFormatCurrency,
} from "@/lib/format";

export function useCurrency() {
	const { user } = useAuth();
	const locale = useLocale();
	const userCurrency = user?.currency || "EUR";
	const amountFormat = (user?.amount_format || "automatic") as AmountFormat;

	const formatCurrency = (value: number): string => {
		return baseFormatCurrency(value, userCurrency, locale, amountFormat);
	};

	return {
		currency: userCurrency,
		amountFormat,
		formatCurrency,
	};
}
