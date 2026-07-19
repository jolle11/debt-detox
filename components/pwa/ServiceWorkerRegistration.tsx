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

		let reloading = false;
		const handleControllerChange = () => {
			if (reloading) return;
			reloading = true;
			window.location.reload();
		};

		navigator.serviceWorker.addEventListener(
			"controllerchange",
			handleControllerChange,
		);

		void navigator.serviceWorker
			.register("/sw.js", { updateViaCache: "none" })
			.then((registration) => registration.update());

		return () => {
			navigator.serviceWorker.removeEventListener(
				"controllerchange",
				handleControllerChange,
			);
		};
	}, []);

	return null;
}
