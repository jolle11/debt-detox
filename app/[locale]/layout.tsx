import type { Metadata } from "next";
import { Inconsolata } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

const inconsolata = Inconsolata({
	variable: "--font-inconsolata",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Debt Detox",
	description: "Take control of your financial commitments",
};

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
			<body
				className={`${inconsolata.variable} antialiased`}
				style={{
					fontFamily:
						"var(--font-inconsolata), Inconsolata, ui-sans-serif, system-ui, sans-serif",
				}}
			>
				<NextIntlClientProvider messages={messages}>
					{children}
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
