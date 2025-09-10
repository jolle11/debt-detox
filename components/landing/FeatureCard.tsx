"use client";

import { useTranslations } from "next-intl";
import { LandingFeature } from "@/data/landing";

interface FeatureCardProps {
	feature: LandingFeature;
}

export default function FeatureCard({ feature }: FeatureCardProps) {
	const tLanding = useTranslations("landing");

	return (
		<div className="card bg-base-100 shadow-xl">
			<div className="card-body items-center text-center">
				<div className="text-4xl mb-2">{feature.icon}</div>
				<h3 className="card-title">{tLanding(feature.titleKey)}</h3>
				<p className="text-sm">{tLanding(feature.descriptionKey)}</p>
			</div>
		</div>
	);
}
