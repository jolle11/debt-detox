"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	const t = useTranslations("error");
	const router = useRouter();

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="container mx-auto px-4 py-12 flex items-center justify-center">
			<div className="card bg-base-100 shadow-xl max-w-md w-full">
				<div className="card-body text-center gap-4">
					<h2 className="card-title text-2xl justify-center text-error">
						{t("title")}
					</h2>
					<p className="text-base-content/70">{t("debtNotLoaded")}</p>
					<div className="card-actions justify-center gap-2">
						<button className="btn btn-primary" onClick={reset}>
							{t("retry")}
						</button>
						<button
							className="btn btn-ghost"
							onClick={() => router.back()}
						>
							{t("back")}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
