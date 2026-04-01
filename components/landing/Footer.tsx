"use client";

import { useTranslations } from "next-intl";

export default function Footer() {
	const t = useTranslations("landing.footer");
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-base-content/10 bg-base-100/50 backdrop-blur-sm">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
					<p className="text-sm text-base-content/60">
						© {currentYear} Debt Detox. {t("rights")}
					</p>

					<div className="flex items-center gap-4">
						<a
							href="https://www.jordi-olle.com"
							target="_blank"
							rel="noopener noreferrer"
							aria-label={t("website")}
							className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								className="h-5 w-5"
							>
								<circle cx="12" cy="12" r="10" />
								<path d="M2 12h20" />
								<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
							</svg>
						</a>

						<a
							href="https://x.com/jordi0lle"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="X (Twitter)"
							className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="currentColor"
								className="h-5 w-5"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
