"use client";

import { useTranslations } from "next-intl";

interface CTASectionProps {
	onLoginClick: () => void;
}

export default function CTASection({ onLoginClick }: CTASectionProps) {
	const tAuth = useTranslations("auth");
	const tLanding = useTranslations("landing");

	return (
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
					onClick={onLoginClick}
				>
					{tAuth("loginRegisterButton")}
				</button>
			</div>
		</div>
	);
}