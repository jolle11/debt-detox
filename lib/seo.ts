import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_NAME = "Debt Detox";
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
	"https://debtdetox.vercel.app";

type SupportedLocale = (typeof routing.locales)[number];

interface LocaleSeo {
	title: string;
	description: string;
	openGraphLocale: string;
	features: string[];
}

const localeSeo: Record<SupportedLocale, LocaleSeo> = {
	es: {
		title: "Controla deudas, prestamos y cuotas",
		description:
			"Gestiona deudas, prestamos y pagos mensuales en una app simple. Sigue tu progreso, controla fechas de cuotas y comparte vistas cuando lo necesites.",
		openGraphLocale: "es_ES",
		features: [
			"Seguimiento de deudas y prestamos",
			"Control de cuotas y fechas de pago",
			"Visualizacion del progreso de amortizacion",
			"Vistas compartidas con enlaces privados",
		],
	},
	en: {
		title: "Track debts, loans and monthly payments",
		description:
			"Manage debts, loans and monthly payments in one place. Track payoff progress, monitor due dates and share private debt views when needed.",
		openGraphLocale: "en_US",
		features: [
			"Debt and loan tracking",
			"Monthly payment monitoring",
			"Payoff progress visualization",
			"Private shared debt views",
		],
	},
	fr: {
		title: "Suivez vos dettes, prets et mensualites",
		description:
			"Gerez vos dettes, prets et paiements mensuels dans une seule application. Suivez votre progression, vos echeances et partagez des vues privees si besoin.",
		openGraphLocale: "fr_FR",
		features: [
			"Suivi des dettes et prets",
			"Gestion des mensualites",
			"Visualisation de la progression",
			"Vues partagees privees",
		],
	},
	de: {
		title: "Verwalte Schulden, Kredite und Monatsraten",
		description:
			"Behalte Schulden, Kredite und monatliche Zahlungen im Blick. Verfolge Fortschritt, Falligkeiten und teile private Ansichten bei Bedarf.",
		openGraphLocale: "de_DE",
		features: [
			"Schulden- und Kreditverwaltung",
			"Monatliche Raten im Blick",
			"Visualisierung des Tilgungsfortschritts",
			"Private Freigabelinks",
		],
	},
	pt: {
		title: "Controle dividas, emprestimos e parcelas",
		description:
			"Gerencie dividas, emprestimos e pagamentos mensais em um so lugar. Acompanhe seu progresso, datas de vencimento e compartilhe visualizacoes privadas.",
		openGraphLocale: "pt_PT",
		features: [
			"Controle de dividas e emprestimos",
			"Acompanhamento de parcelas mensais",
			"Visualizacao do progresso",
			"Compartilhamento privado",
		],
	},
	nl: {
		title: "Beheer schulden, leningen en maandlasten",
		description:
			"Beheer schulden, leningen en maandelijkse betalingen in een overzichtelijke app. Volg aflossing, vervaldata en deel priveoverzichten wanneer nodig.",
		openGraphLocale: "nl_NL",
		features: [
			"Schulden en leningen beheren",
			"Maandelijkse betalingen volgen",
			"Aflosvoortgang visualiseren",
			"Prive gedeelde overzichten",
		],
	},
};

export const DEFAULT_OG_IMAGE = {
	url: "/og-image.png",
	width: 1200,
	height: 630,
	alt: `${SITE_NAME} overview`,
};

export const NO_INDEX_ROBOTS: NonNullable<Metadata["robots"]> = {
	index: false,
	follow: false,
	nocache: true,
};

export function getLocaleSeo(locale: string): LocaleSeo {
	const fallbackLocale = routing.defaultLocale as SupportedLocale;
	return localeSeo[(locale as SupportedLocale) || fallbackLocale] || localeSeo[fallbackLocale];
}

export function getLocalizedPath(locale: string, pathname = "/") {
	const normalizedPath =
		pathname === "/"
			? "/"
			: pathname.startsWith("/")
				? pathname
				: `/${pathname}`;

	if (locale === routing.defaultLocale) {
		return normalizedPath;
	}

	return normalizedPath === "/" ? `/${locale}` : `/${locale}${normalizedPath}`;
}

export function getLocalizedUrl(locale: string, pathname = "/") {
	return `${SITE_URL}${getLocalizedPath(locale, pathname)}`;
}

export function getLanguageAlternates(pathname = "/") {
	return {
		...Object.fromEntries(
			routing.locales.map((locale) => [locale, getLocalizedUrl(locale, pathname)]),
		),
		"x-default": getLocalizedUrl(routing.defaultLocale, pathname),
	};
}
