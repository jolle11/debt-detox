"use client";

import { useTranslations } from "next-intl";
import { hero, heroFeatures } from "@/data/landing";
import FeatureCard from "./FeatureCard";

interface HeroSectionProps {
	onLoginClick: () => void;
}

export default function HeroSection({ onLoginClick }: HeroSectionProps) {
	const tAuth = useTranslations("auth");
	const tLanding = useTranslations("landing");

	return (
		<div className="hero min-h-screen">
			<div className="hero-content text-center">
				<div className="max-w-4xl">
					<div className="mb-8">
						<div className="text-6xl mb-4">{hero.icon}</div>
						<h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
							{hero.title}
						</h1>
						<p className="text-xl text-base-content/80 mt-4">
							{tLanding(hero.subtitleKey)}
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 my-16">
						{heroFeatures.map((feature, index) => (
							<FeatureCard key={index} feature={feature} />
						))}
					</div>

					<div className="space-y-4">
						<button
							className="btn btn-primary btn-lg px-8"
							onClick={onLoginClick}
						>
							{tAuth("loginRegisterButton")}
						</button>
						<p className="text-sm text-base-content/60">
							{tLanding(hero.featuresKey)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
