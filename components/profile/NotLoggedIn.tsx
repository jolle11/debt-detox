import { useTranslations } from "next-intl";

export default function NotLoggedIn() {
	const t = useTranslations("profile");

	return (
		<div className="flex justify-center items-center min-h-[50vh]">
			<div className="text-center">
				<h2 className="text-xl font-semibold mb-2">
					{t("notLoggedIn") || "Not logged in"}
				</h2>
				<p className="text-base-content/70">
					{t("loginRequired") || "Please log in to view your profile"}
				</p>
			</div>
		</div>
	);
}
