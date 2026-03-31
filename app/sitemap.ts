import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getLocalizedUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
	const lastModified = new Date();

	return routing.locales.map((locale) => ({
		url: getLocalizedUrl(locale),
		lastModified,
		changeFrequency: "weekly",
		priority: locale === routing.defaultLocale ? 1 : 0.8,
	}));
}
