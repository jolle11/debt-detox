import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Locale = (typeof routing.locales)[number];

function isValidLocale(locale: string | undefined): locale is Locale {
	return (
		locale !== undefined &&
		(routing.locales as readonly string[]).includes(locale)
	);
}

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	if (!isValidLocale(locale)) {
		locale = routing.defaultLocale;
	}

	return {
		locale,
		messages: (await import(`../messages/${locale}.json`)).default,
	};
});
