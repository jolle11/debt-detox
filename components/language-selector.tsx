"use client";

import { CaretDownIcon, CheckIcon, TranslateIcon } from "@phosphor-icons/react";
import { useLocale } from "next-intl";
import { startTransition } from "react";
import { usePathname, useRouter } from "@/i18n/routing";

const languages = [
	{ code: "es", name: "Español", flag: "🇪🇸", nativeName: "Español" },
	{ code: "en", name: "English", flag: "🇺🇸", nativeName: "English" },
	{ code: "fr", name: "Français", flag: "🇫🇷", nativeName: "Français" },
	{ code: "de", name: "Deutsch", flag: "🇩🇪", nativeName: "Deutsch" },
];

export default function LanguageSelector() {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const handleLanguageChange = (newLocale: string) => {
		startTransition(() => {
			router.replace(pathname, { locale: newLocale });
		});
	};

	const currentLanguage = languages.find((lang) => lang.code === locale);

	return (
		<div className="dropdown dropdown-end">
			<div
				tabIndex={0}
				role="button"
				className="btn btn-ghost btn-sm gap-2"
			>
				<TranslateIcon size={16} />
				<span className="hidden sm:inline">
					{currentLanguage?.nativeName}
				</span>
				<span className="sm:hidden">{currentLanguage?.flag}</span>
				<CaretDownIcon size={12} />
			</div>

			<ul
				tabIndex={0}
				className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 mt-1 border border-base-300"
			>
				{languages.map((language) => (
					<li key={language.code}>
						<button
							onClick={() => handleLanguageChange(language.code)}
							className={`flex items-center w-full gap-3 ${
								locale === language.code
									? "bg-primary text-primary-content"
									: "hover:bg-base-200"
							} rounded-lg transition-colors`}
						>
							<span className="text-lg">{language.flag}</span>
							<div className="flex flex-col items-start">
								<span className="font-medium">
									{language.nativeName}
								</span>
								<span className="text-xs opacity-70">
									{language.name}
								</span>
							</div>
							{locale === language.code && (
								<CheckIcon size={16} className="ml-auto" />
							)}
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
