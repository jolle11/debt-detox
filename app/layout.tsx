import type { Metadata, Viewport } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	applicationName: SITE_NAME,
	description: "Manage debts, loans and monthly payments in one place.",
	manifest: "/manifest.webmanifest",
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: SITE_NAME,
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/money-bag.ico" },
			{ url: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
			{ url: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
		shortcut: ["/favicon.ico"],
	},
	openGraph: {
		siteName: SITE_NAME,
		type: "website",
		images: [DEFAULT_OG_IMAGE],
	},
	twitter: {
		card: "summary_large_image",
		images: [DEFAULT_OG_IMAGE.url],
	},
};

export const viewport: Viewport = {
	themeColor: "#0f766e",
	colorScheme: "light",
	width: "device-width",
	initialScale: 1,
	viewportFit: "cover",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
