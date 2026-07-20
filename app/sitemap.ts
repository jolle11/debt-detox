import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLanguageAlternates, getLocalizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();
	const languages = getLanguageAlternates();

	return routing.locales.map((locale) => ({
		url: getLocalizedUrl(locale),
		lastModified,
		changeFrequency: "weekly",
		priority: locale === routing.defaultLocale ? 1 : 0.8,
		alternates: { languages },
	}));
}
