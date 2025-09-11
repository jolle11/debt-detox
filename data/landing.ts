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
		icon: "📊",
		titleKey: "features.trackProgress.title",
		descriptionKey: "features.trackProgress.description",
	},
	{
		icon: "💰",
		titleKey: "features.managePayments.title",
		descriptionKey: "features.managePayments.description",
	},
	{
		icon: "📈",
		titleKey: "features.stayMotivated.title",
		descriptionKey: "features.stayMotivated.description",
	},
];

export const detailsFeatures: LandingDetail[] = [
	{
		icon: "💰",
		bgColor: "bg-primary/20",
		titleKey: "details.amountTracking.title",
		descriptionKey: "details.amountTracking.description",
	},
	{
		icon: "📅",
		bgColor: "bg-secondary/20",
		titleKey: "details.dateManagement.title",
		descriptionKey: "details.dateManagement.description",
	},
	{
		icon: "🏦",
		bgColor: "bg-success/20",
		titleKey: "details.entityDetails.title",
		descriptionKey: "details.entityDetails.description",
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
	subtitleKey: "hero.subtitle",
	featuresKey: "hero.features",
};
