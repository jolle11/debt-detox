import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import "../globals.css";
import { NO_INDEX_ROBOTS, SITE_NAME } from "@/lib/seo";
import { resolveRequestLocale } from "@/lib/sharedPresentation";

const inconsolata = Inconsolata({
	variable: "--font-inconsolata",
	subsets: ["latin"],
});

async function getShareIntl() {
	const requestHeaders = await headers();
	const locale = resolveRequestLocale(requestHeaders.get("accept-language"));
	const messages = (await import(`../../messages/${locale}.json`)).default as {
		share?: {
			metaTitle?: string;
		};
	};

	return { locale, messages };
}

export async function generateMetadata(): Promise<Metadata> {
	const { messages } = await getShareIntl();

	return {
		title: `${messages.share?.metaTitle || "Shared View"} | ${SITE_NAME}`,
		robots: NO_INDEX_ROBOTS,
	};
}

export default async function ShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { locale, messages } = await getShareIntl();

	return (
		<html lang={locale}>
			<body
				className={`${inconsolata.variable} antialiased`}
				style={{
					fontFamily:
						"var(--font-inconsolata), Inconsolata, ui-sans-serif, system-ui, sans-serif",
				}}
			>
				<div className="min-h-screen bg-base-200">
					<NextIntlClientProvider locale={locale} messages={messages}>
						<main className="container mx-auto p-4 max-w-2xl">{children}</main>
					</NextIntlClientProvider>
				</div>
			</body>
		</html>
	);
}
