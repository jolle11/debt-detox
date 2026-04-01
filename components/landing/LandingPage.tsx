"use client";

import { useEffect, useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useRouter } from "@/i18n/routing";
import { useAuth } from "@/contexts/AuthContext";
import CTASection from "./CTASection";
import DemoSection from "./DemoSection";
import DetailsSection from "./DetailsSection";
import Footer from "./Footer";
import HeroSection from "./HeroSection";

export default function LandingPage() {
	const [showAuthModal, setShowAuthModal] = useState(false);
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && user) {
			router.replace("/dashboard");
		}
	}, [loading, router, user]);

	if (user) {
		return null;
	}

	return (
		<main className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
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
			<Footer />

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</main>
	);
}
