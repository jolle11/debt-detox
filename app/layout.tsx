import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Debt Detox",
	description: "Take control of your financial commitments",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
