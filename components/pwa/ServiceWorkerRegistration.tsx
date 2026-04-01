"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
	useEffect(() => {
		if (
			process.env.NODE_ENV !== "production" ||
			typeof window === "undefined" ||
			!("serviceWorker" in navigator)
		) {
			return;
		}

		void navigator.serviceWorker.register("/sw.js");
	}, []);

	return null;
}
