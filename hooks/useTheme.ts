"use client";

import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

export function useTheme() {
	const [theme, setTheme] = useState<ThemeMode>("system");
	const [actualTheme, setActualTheme] = useState<"light" | "dark">("light");

	useEffect(() => {
		const savedTheme = localStorage.getItem("theme") as ThemeMode;
		if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
			setTheme(savedTheme);
		}
	}, []);

	useEffect(() => {
		const updateActualTheme = () => {
			let newActualTheme: "light" | "dark";

			if (theme === "system") {
				newActualTheme = window.matchMedia(
					"(prefers-color-scheme: dark)",
				).matches
					? "dark"
					: "light";
			} else {
				newActualTheme = theme;
			}

			setActualTheme(newActualTheme);

			const html = document.documentElement;
			html.setAttribute("data-theme", newActualTheme);
			html.classList.toggle("dark", newActualTheme === "dark");
		};

		updateActualTheme();

		if (theme === "system") {
			const mediaQuery = window.matchMedia(
				"(prefers-color-scheme: dark)",
			);
			mediaQuery.addEventListener("change", updateActualTheme);
			return () =>
				mediaQuery.removeEventListener("change", updateActualTheme);
		}
	}, [theme]);

	const changeTheme = (newTheme: ThemeMode) => {
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);
	};

	return {
		theme,
		actualTheme,
		changeTheme,
	};
}
