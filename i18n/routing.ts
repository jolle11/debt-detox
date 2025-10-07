import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["es", "en", "fr", "de", "pt", "nl"],
	defaultLocale: "es",
	localePrefix: "as-needed",
});

export const { Link, redirect, usePathname, useRouter } =
	createNavigation(routing);
