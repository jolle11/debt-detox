"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import DemoContainer from "@/components/demo/DemoContainer";
import { DemoProvider } from "@/components/demo/DemoProvider";
import LanguageSelector from "@/components/language-selector";
import ThemeToggle from "@/components/ui/ThemeToggle";

export default function LandingPage() {
	const t = useTranslations();
	const tAuth = useTranslations("auth");
	const tLanding = useTranslations("landing");
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

			{/* Hero Section */}
			<div className="hero min-h-screen">
				<div className="hero-content text-center">
					<div className="max-w-4xl">
						<div className="mb-8">
							<div className="text-6xl mb-4">💳</div>
							<h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
								Debt Detox
							</h1>
							<p className="text-xl text-base-content/80 mt-4">
								{tLanding("hero.subtitle")}
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 my-16">
							<div className="card bg-base-100 shadow-xl">
								<div className="card-body items-center text-center">
									<div className="text-4xl mb-2">📊</div>
									<h3 className="card-title">
										{tLanding(
											"features.trackProgress.title",
										)}
									</h3>
									<p className="text-sm">
										{tLanding(
											"features.trackProgress.description",
										)}
									</p>
								</div>
							</div>

							<div className="card bg-base-100 shadow-xl">
								<div className="card-body items-center text-center">
									<div className="text-4xl mb-2">🎯</div>
									<h3 className="card-title">
										{tLanding("features.setGoals.title")}
									</h3>
									<p className="text-sm">
										{tLanding(
											"features.setGoals.description",
										)}
									</p>
								</div>
							</div>

							<div className="card bg-base-100 shadow-xl">
								<div className="card-body items-center text-center">
									<div className="text-4xl mb-2">📈</div>
									<h3 className="card-title">
										{tLanding(
											"features.stayMotivated.title",
										)}
									</h3>
									<p className="text-sm">
										{tLanding(
											"features.stayMotivated.description",
										)}
									</p>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<button
								className="btn btn-primary btn-lg px-8"
								onClick={() => setShowAuthModal(true)}
							>
								{tAuth("loginRegisterButton")}
							</button>
							<p className="text-sm text-base-content/60">
								{tLanding("hero.features")}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="py-20 bg-base-200">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							{tLanding("details.title")}
						</h2>
						<p className="text-xl text-base-content/70">
							{tLanding("details.subtitle")}
						</p>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
						<div className="text-center">
							<div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">💰</span>
							</div>
							<h3 className="font-semibold mb-2">
								{tLanding("details.amountTracking.title")}
							</h3>
							<p className="text-sm text-base-content/70">
								{tLanding("details.amountTracking.description")}
							</p>
						</div>

						<div className="text-center">
							<div className="bg-secondary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">📅</span>
							</div>
							<h3 className="font-semibold mb-2">
								{tLanding("details.dateManagement.title")}
							</h3>
							<p className="text-sm text-base-content/70">
								{tLanding("details.dateManagement.description")}
							</p>
						</div>

						<div className="text-center">
							<div className="bg-success/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
								<span className="text-2xl">🏦</span>
							</div>
							<h3 className="font-semibold mb-2">
								{tLanding("details.entityDetails.title")}
							</h3>
							<p className="text-sm text-base-content/70">
								{tLanding("details.entityDetails.description")}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Demo Section */}
			<div className="py-20 bg-base-100">
				<div className="container mx-auto px-4">
					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold mb-4">
							{tLanding("demo.title")}
						</h2>
						<p className="text-xl text-base-content/70">
							{tLanding("demo.subtitle")}
						</p>
					</div>

					<div className="max-w-6xl mx-auto">
						<DemoProvider>
							<DemoContainer
								onLoginClick={() => setShowAuthModal(true)}
							/>
						</DemoProvider>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-20">
				<div className="container mx-auto px-4 text-center">
					<h2 className="text-4xl font-bold mb-4">
						{tLanding("cta.title")}
					</h2>
					<p className="text-xl text-base-content/70 mb-8">
						{tLanding("cta.subtitle")}
					</p>
					<button
						className="btn btn-primary btn-lg px-8"
						onClick={() => setShowAuthModal(true)}
					>
						{tAuth("loginRegisterButton")}
					</button>
				</div>
			</div>

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</div>
	);
}
