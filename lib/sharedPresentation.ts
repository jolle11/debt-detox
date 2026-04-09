import { routing } from "@/i18n/routing";

type SupportedLocale = (typeof routing.locales)[number];

const DEFAULT_LOCALE = routing.defaultLocale as SupportedLocale;
const DEFAULT_CURRENCY = "EUR";

const FORMAT_LOCALES: Record<SupportedLocale, string> = {
	es: "es-ES",
	en: "en-US",
	fr: "fr-FR",
	de: "de-DE",
	pt: "pt-PT",
	nl: "nl-NL",
};

function matchSupportedLocale(value?: string | null): SupportedLocale | null {
	if (!value) return null;

	const normalized = value.trim().toLowerCase().replace(/_/g, "-");
	if (!normalized) return null;

	if (routing.locales.includes(normalized as SupportedLocale)) {
		return normalized as SupportedLocale;
	}

	const baseLocale = normalized.split("-")[0];
	if (routing.locales.includes(baseLocale as SupportedLocale)) {
		return baseLocale as SupportedLocale;
	}

	return null;
}

export function resolveRequestLocale(
	acceptLanguage?: string | null,
): SupportedLocale {
	if (!acceptLanguage) return DEFAULT_LOCALE;

	for (const entry of acceptLanguage.split(",")) {
		const candidate = entry.split(";")[0]?.trim();
		const locale = matchSupportedLocale(candidate);
		if (locale) {
			return locale;
		}
	}

	return DEFAULT_LOCALE;
}

export function resolveSharedLocale(options?: {
	preferredLocale?: string | null;
	preferredLanguage?: string | null;
	acceptLanguage?: string | null;
	navigatorLanguage?: string | null;
}): SupportedLocale {
	return (
		matchSupportedLocale(options?.preferredLocale) ||
		matchSupportedLocale(options?.preferredLanguage) ||
		matchSupportedLocale(options?.navigatorLanguage) ||
		resolveRequestLocale(options?.acceptLanguage)
	);
}

export function getFormattingLocale(locale?: string | null): string {
	return FORMAT_LOCALES[resolveSharedLocale({ preferredLocale: locale })];
}

export function resolveSharedCurrency(currency?: string | null): string {
	const normalized = currency?.trim().toUpperCase();
	return normalized && /^[A-Z]{3}$/.test(normalized)
		? normalized
		: DEFAULT_CURRENCY;
}

export function extractUserLocale(
	user?: Record<string, unknown> | null,
): string | undefined {
	const localeFields = ["locale", "language", "lang"] as const;

	for (const field of localeFields) {
		const value = user?.[field];
		if (typeof value === "string" && value.trim()) {
			return value.trim();
		}
	}

	return undefined;
}
