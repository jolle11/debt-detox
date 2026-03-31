import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";
import {
	DEFAULT_OG_IMAGE,
	SITE_NAME,
	getLanguageAlternates,
	getLocalizedUrl,
	getLocaleSeo,
} from "@/lib/seo";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const seo = getLocaleSeo(locale);
	const url = getLocalizedUrl(locale);

	return {
		title: seo.title,
		description: seo.description,
		alternates: {
			canonical: url,
			languages: getLanguageAlternates(),
		},
		openGraph: {
			title: seo.title,
			description: seo.description,
			url,
			locale: seo.openGraphLocale,
			type: "website",
			images: [DEFAULT_OG_IMAGE],
		},
		twitter: {
			card: "summary_large_image",
			title: seo.title,
			description: seo.description,
			images: [DEFAULT_OG_IMAGE.url],
		},
	};
}

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	const seo = getLocaleSeo(locale);
	const url = getLocalizedUrl(locale);
	const structuredData = [
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			name: SITE_NAME,
			url,
			inLanguage: locale,
			description: seo.description,
		},
		{
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: SITE_NAME,
			applicationCategory: "FinanceApplication",
			operatingSystem: "Web",
			url,
			inLanguage: locale,
			description: seo.description,
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "EUR",
			},
			featureList: seo.features,
		},
	];

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(structuredData),
				}}
			/>
			<LandingPage />
		</>
	);
}
