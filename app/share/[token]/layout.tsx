import { Inconsolata } from "next/font/google";
import "../../globals.css";

const inconsolata = Inconsolata({
	variable: "--font-inconsolata",
	subsets: ["latin"],
});

export default function ShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="es">
			<body
				className={`${inconsolata.variable} antialiased`}
				style={{
					fontFamily:
						"var(--font-inconsolata), Inconsolata, ui-sans-serif, system-ui, sans-serif",
				}}
			>
				<div className="min-h-screen bg-base-200">
					<main className="container mx-auto p-4 max-w-2xl">
						{children}
					</main>
				</div>
			</body>
		</html>
	);
}
