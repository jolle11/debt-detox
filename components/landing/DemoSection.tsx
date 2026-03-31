"use client";

import { useTranslations } from "next-intl";
import DemoContainer from "@/components/demo/DemoContainer";
import { DemoProvider } from "@/components/demo/DemoProvider";

interface DemoSectionProps {
	onLoginClick: () => void;
}

export default function DemoSection({ onLoginClick }: DemoSectionProps) {
	const tLanding = useTranslations("landing");

	return (
		<section className="py-20 bg-base-100" aria-labelledby="demo-title">
			<div className="container mx-auto px-4">
				<header className="text-center mb-16">
					<h2 id="demo-title" className="text-4xl font-bold mb-4">
						{tLanding("demo.title")}
					</h2>
					<p className="text-xl text-base-content/70">
						{tLanding("demo.subtitle")}
					</p>
				</header>

				<div className="max-w-6xl mx-auto">
					<DemoProvider>
						<DemoContainer onLoginClick={onLoginClick} />
					</DemoProvider>
				</div>
			</div>
		</section>
	);
}
