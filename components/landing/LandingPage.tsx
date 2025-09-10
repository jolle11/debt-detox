"use client";

import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import LanguageSelector from "@/components/language-selector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import HeroSection from "./HeroSection";
import DetailsSection from "./DetailsSection";
import DemoSection from "./DemoSection";
import CTASection from "./CTASection";

export default function LandingPage() {
	const [showAuthModal, setShowAuthModal] = useState(false);

	return (
		<div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
			{/* Header with Language and Theme Selectors */}
			<div className="absolute top-4 left-4 z-10">
				<LanguageSelector />
			</div>
			<div className="absolute top-4 right-4 z-10">
				<ThemeToggle />
			</div>

			<HeroSection onLoginClick={() => setShowAuthModal(true)} />
			<DetailsSection />
			<DemoSection onLoginClick={() => setShowAuthModal(true)} />
			<CTASection onLoginClick={() => setShowAuthModal(true)} />

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</div>
	);
}
