"use client";

import { useTranslations } from "next-intl";

interface DebtNotFoundProps {
	onBack: () => void;
}

export default function DebtNotFound({ onBack }: DebtNotFoundProps) {
	const t = useTranslations();

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex items-center justify-center min-h-[50vh]">
				<div className="text-center">
					<h2 className="text-xl font-semibold mb-2">
						{t("debtDetail.notFound.title")}
					</h2>
					<p className="text-base-content/70 mb-4">
						{t("debtDetail.notFound.description")}
					</p>
					<button onClick={onBack} className="btn btn-primary">
						{t("common.back")}
					</button>
				</div>
			</div>
		</div>
	);
}
