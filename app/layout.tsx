import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	applicationName: SITE_NAME,
	title: {
		default: SITE_NAME,
		template: `%s | ${SITE_NAME}`,
	},
	icons: {
		icon: [
			{ url: "/favicon.ico" },
			{ url: "/money-bag.ico" },
		],
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

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
