import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/seo";

const themeColor = "#0f766e";
const backgroundColor = "#f5f5f4";

export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: SITE_NAME,
		short_name: "Debt Detox",
		description: "Track debts, loans and monthly payments from your phone.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		orientation: "portrait",
		background_color: backgroundColor,
		theme_color: themeColor,
		lang: "es",
		categories: ["finance", "productivity"],
		icons: [
			{
				src: "/pwa-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/pwa-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/pwa-192x192.png",
				sizes: "192x192",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/pwa-512x512.png",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
			{
				src: "/apple-touch-icon.png",
				sizes: "180x180",
				type: "image/png",
			},
		],
	};
}
