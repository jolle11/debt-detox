import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "../globals.css";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import ClientLayout from "@/components/layout/ClientLayout";
import { routing } from "@/i18n/routing";
import { DEFAULT_OG_IMAGE, SITE_NAME, getLocaleSeo } from "@/lib/seo";

const inconsolata = Inconsolata({
	variable: "--font-inconsolata",
	subsets: ["latin"],
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>;
}): Promise<Metadata> {
	const { locale } = await params;
	const seo = getLocaleSeo(locale);

	return {
		title: {
			default: SITE_NAME,
			template: `%s | ${SITE_NAME}`,
		},
		description: seo.description,
		openGraph: {
			title: SITE_NAME,
			description: seo.description,
			locale: seo.openGraphLocale,
			images: [DEFAULT_OG_IMAGE],
		},
		twitter: {
			title: SITE_NAME,
			description: seo.description,
			images: [DEFAULT_OG_IMAGE.url],
		},
	};
}

export default async function LocaleLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as any)) {
		notFound();
	}

	// Providing all messages to the client side
	const messages = await getMessages({ locale });

	return (
		<html lang={locale}>
			<head>
				<script defer src="https://assets.onedollarstats.com/stonks.js" />
			</head>
			<body
				className={`${inconsolata.variable} antialiased`}
				style={{
					fontFamily:
						"var(--font-inconsolata), Inconsolata, ui-sans-serif, system-ui, sans-serif",
				}}
			>
				<NextIntlClientProvider messages={messages}>
					<ClientLayout>{children}</ClientLayout>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
