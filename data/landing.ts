export interface LandingFeature {
	icon: string;
	titleKey: string;
	descriptionKey: string;
}

export interface LandingDetail {
	icon: string;
	bgColor: string;
	titleKey: string;
	descriptionKey: string;
}

export interface LandingSection {
	id: string;
	titleKey: string;
	subtitleKey: string;
}

export const heroFeatures: LandingFeature[] = [
	{
		icon: "🧩",
		titleKey: "features.customDashboard.title",
		descriptionKey: "features.customDashboard.description",
	},
	{
		icon: "🤝",
		titleKey: "features.sharedDebts.title",
		descriptionKey: "features.sharedDebts.description",
	},
	{
		icon: "⚡",
		titleKey: "features.extraPayments.title",
		descriptionKey: "features.extraPayments.description",
	},
];

export const detailsFeatures: LandingDetail[] = [
	{
		icon: "🔎",
		bgColor: "bg-primary/20",
		titleKey: "details.sortFilter.title",
		descriptionKey: "details.sortFilter.description",
	},
	{
		icon: "📆",
		bgColor: "bg-secondary/20",
		titleKey: "details.monthlyPayments.title",
		descriptionKey: "details.monthlyPayments.description",
	},
	{
		icon: "🔒",
		bgColor: "bg-success/20",
		titleKey: "details.privacy.title",
		descriptionKey: "details.privacy.description",
	},
];

export const landingSections: LandingSection[] = [
	{
		id: "details",
		titleKey: "details.title",
		subtitleKey: "details.subtitle",
	},
	{
		id: "demo",
		titleKey: "demo.title",
		subtitleKey: "demo.subtitle",
	},
	{
		id: "cta",
		titleKey: "cta.title",
		subtitleKey: "cta.subtitle",
	},
];

export const hero = {
	icon: "💳",
	title: "Debt Detox",
	taglineKey: "hero.tagline",
	subtitleKey: "hero.subtitle",
	featuresKey: "hero.features",
};
