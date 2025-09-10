"use client";

import { useTranslations } from "next-intl";
import { detailsFeatures } from "@/data/landing";
import DetailCard from "./DetailCard";

export default function DetailsSection() {
	const tLanding = useTranslations("landing");

	return (
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
					{detailsFeatures.map((detail, index) => (
						<DetailCard key={index} detail={detail} />
					))}
				</div>
			</div>
		</div>
	);
}