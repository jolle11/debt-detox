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
						<DemoContainer onLoginClick={onLoginClick} />
					</DemoProvider>
				</div>
			</div>
		</div>
	);
}
