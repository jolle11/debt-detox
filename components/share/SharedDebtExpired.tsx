import { LinkBreak } from "@phosphor-icons/react";

export default function SharedDebtExpired() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
			<LinkBreak className="w-16 h-16 text-base-content/30 mb-4" />
			<h1 className="text-2xl font-bold mb-2">Enlace expirado</h1>
			<p className="text-base-content/70 max-w-sm">
				Este enlace ha expirado o no es válido. Pide al propietario que genere
				uno nuevo.
			</p>
			<div className="mt-6 text-sm text-base-content/40">Debt Detox</div>
		</div>
	);
}
