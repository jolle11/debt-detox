"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function SessionGuard() {
	const t = useTranslations();
	const [showExpiredNotification, setShowExpiredNotification] =
		useState(false);

	const { checkSession } = useAuthGuard({
		checkInterval: 5 * 60 * 1000, // Check every 5 minutes
		onSessionExpired: () => {
			setShowExpiredNotification(true);
			// Auto-hide notification after 10 seconds
			setTimeout(() => {
				setShowExpiredNotification(false);
			}, 10000);
		},
	});

	// Session checks are handled by the useAuthGuard hook's periodic checks
	// Manual check only on user activity or visibility changes

	if (!showExpiredNotification) return null;

	return (
		<div className="toast toast-top toast-center z-50">
			<div className="alert alert-warning shadow-lg">
				<div className="flex items-center gap-2">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
					<span>{t("auth.session.expired")}</span>
				</div>
				<div className="flex-none">
					<button
						className="btn btn-sm btn-ghost"
						onClick={() => setShowExpiredNotification(false)}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	);
}
