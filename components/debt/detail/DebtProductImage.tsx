"use client";

import { FileTextIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import type { DebtProductImageProps } from "@/data/debtDetail";

export default function DebtProductImage({ debt }: DebtProductImageProps) {
	const t = useTranslations();

	if (!debt.product_image) {
		return null;
	}

	return (
		<div className="card bg-base-100 shadow-sm">
			<div className="card-body p-4">
				<h2 className="card-title text-lg mb-2">
					<FileTextIcon className="w-5 h-5" />
					{t("debtDetail.sections.product")}
				</h2>
				{/* biome-ignore lint/performance/noImgElement: user-provided URLs from any host can't go through next/image without a domain allowlist. */}
				<img
					src={debt.product_image}
					alt={debt.name}
					className="w-full max-w-sm mx-auto rounded-lg shadow-sm"
				/>
			</div>
		</div>
	);
}
