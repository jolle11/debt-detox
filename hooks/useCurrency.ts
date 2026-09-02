"use client";

import { useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import {
	type AmountFormat,
	formatCurrency as baseFormatCurrency,
	type NumberFormat,
	resolveNumberLocale,
} from "@/lib/format";

export function useCurrency() {
	const { user } = useAuth();
	const locale = useLocale();
	const userCurrency = user?.currency || "EUR";
	const amountFormat = (user?.amount_format || "automatic") as AmountFormat;
	const numberFormat = (user?.number_format || "locale") as NumberFormat;
	const numberLocale = resolveNumberLocale(locale, numberFormat);

	const formatCurrency = (value: number): string => {
		return baseFormatCurrency(value, userCurrency, numberLocale, amountFormat);
	};

	return {
		currency: userCurrency,
		amountFormat,
		numberFormat,
		formatCurrency,
	};
}
