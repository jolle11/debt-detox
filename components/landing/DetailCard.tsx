"use client";

import { useTranslations } from "next-intl";
import { LandingDetail } from "@/data/landing";

interface DetailCardProps {
	detail: LandingDetail;
}

export default function DetailCard({ detail }: DetailCardProps) {
	const tLanding = useTranslations("landing");

	return (
		<div className="text-center">
			<div
				className={`${detail.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
			>
				<span className="text-2xl">{detail.icon}</span>
			</div>
			<h3 className="font-semibold mb-2">{tLanding(detail.titleKey)}</h3>
			<p className="text-sm text-base-content/70">
				{tLanding(detail.descriptionKey)}
			</p>
		</div>
	);
}
