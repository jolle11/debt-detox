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
		<section className="hero min-h-screen" aria-labelledby="landing-title">
			<div className="hero-content text-center">
				<div className="max-w-4xl">
					<header className="mb-8">
						<div className="text-6xl mb-4">{hero.icon}</div>
						<h1 id="landing-title" className="text-5xl font-bold">
							<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
								{hero.title}
							</span>
							<span className="block text-2xl font-semibold text-base-content/90 mt-3">
								{tLanding(hero.taglineKey)}
							</span>
						</h1>
						<p className="text-xl text-base-content/80 mt-4">
							{tLanding(hero.subtitleKey)}
						</p>
					</header>

					<section aria-labelledby="landing-features" className="my-16">
						<h2 id="landing-features" className="sr-only">
							{tLanding("features.heading")}
						</h2>
						<div className="grid md:grid-cols-3 gap-8">
							{heroFeatures.map((feature, index) => (
								<FeatureCard key={index} feature={feature} />
							))}
						</div>
					</section>

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
		</section>
	);
}
