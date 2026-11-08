import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
	const localizedDisallow = routing.locales
		.filter((locale) => locale !== routing.defaultLocale)
		.flatMap((locale) => [
			`/${locale}/dashboard`,
			`/${locale}/profile`,
			`/${locale}/metrics`,
			`/${locale}/debt`,
		]);

	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: [
				"/dashboard",
				"/profile",
				"/metrics",
				"/debt",
				"/share",
				...localizedDisallow,
			],
		},
		host: SITE_URL,
		sitemap: `${SITE_URL}/sitemap.xml`,
	};
}
