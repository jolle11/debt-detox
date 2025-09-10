import Link from "next/link";
import { useTranslations } from "next-intl";
import "./globals.css";

export default function NotFound() {
	const t = useTranslations("notFound");

	return (
		<html lang="es">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<title>{t("title")} | Debt Detox</title>
			</head>
			<body>
				<div className="min-h-screen flex items-center justify-center bg-base-100">
					<div className="text-center">
						<h1 className="text-4xl font-bold mb-4">
							{t("title")}
						</h1>
						<p className="text-lg mb-6">{t("description")}</p>
						<Link href="/" className="btn btn-primary">
							{t("backHome")}
						</Link>
					</div>
				</div>
			</body>
		</html>
	);
}
