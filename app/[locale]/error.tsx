"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
	const t = useTranslations("error");

	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
			<div className="card bg-base-100 shadow-xl max-w-md w-full">
				<div className="card-body text-center gap-4">
					<h2 className="card-title text-2xl justify-center text-error">
						{t("title")}
					</h2>
					<p className="text-base-content/70">{t("description")}</p>
					<div className="card-actions justify-center gap-2">
						<button className="btn btn-primary" onClick={reset}>
							{t("retry")}
						</button>
						<a href="/" className="btn btn-ghost">
							{t("backHome")}
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
