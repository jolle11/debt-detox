import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Debt Detox",
	description: "Take control of your financial commitments",
	openGraph: {
		title: "Debt Detox",
		description: "Take control of your financial commitments",
		url: "https://debtdetox.vercel.app",
		siteName: "Debt Detox",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "Debt Detox - Financial Control App",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Debt Detox",
		description: "Take control of your financial commitments",
		images: ["/og-image.png"],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
