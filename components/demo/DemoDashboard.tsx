"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import SummaryStats from "@/components/dashboard/SummaryStats";
import type { Debt } from "@/lib/types";
import DemoDebtsList from "./DemoDebtsList";
import { useDemoContext } from "./DemoProvider";

interface DemoDashboardProps {
	onLoginClick: () => void;
	onDebtClick?: (debt: Debt) => void;
}

export default function DemoDashboard({
	onLoginClick,
	onDebtClick,
}: DemoDashboardProps) {
	const t = useTranslations();
	const tLanding = useTranslations("landing");
	const { debts, payments } = useDemoContext();
	const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
	const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);

	// Handlers para la demo - no hacen nada real
	const demoHandlers = {
		onEdit: (debt: Debt) => {
			// En la demo, simplemente mostramos un mensaje
			alert(
				"¡Esta es solo una demo! Regístrate para editar tus deudas reales.",
			);
		},
		onDelete: (debt: Debt) => {
			alert(
				"¡Esta es solo una demo! Regístrate para gestionar tus deudas reales.",
			);
		},
		onAddDebt: () => {
			alert(
				"¡Esta es solo una demo! Regístrate para añadir tus deudas reales.",
			);
		},
	};

	return (
		<div className="w-full">
			{/* Demo Badge */}
			<div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl mb-6 text-white">
				<div className="flex items-center justify-between">
					<div>
						<h3 className="text-lg font-bold">
							{tLanding("demo.title")}
						</h3>
						<p className="text-sm opacity-90">
							{tLanding("demo.subtitle")}
						</p>
					</div>
					<button
						onClick={onLoginClick}
						className="btn btn-outline btn-accent btn-sm text-white border-white hover:bg-white hover:text-primary"
					>
						{tLanding("demo.cta")}
					</button>
				</div>
			</div>

			{/* Demo Dashboard Content */}
			<div className="space-y-4">
				{/* Summary Cards */}
				<SummaryStats debts={debts} />

				{/* Debt List */}
				<DemoDebtsList
					debts={debts}
					payments={payments}
					onDebtClick={onDebtClick || (() => {})}
					onEdit={demoHandlers.onEdit}
					onDelete={demoHandlers.onDelete}
					onAddDebt={demoHandlers.onAddDebt}
				/>
			</div>

			{/* Bottom CTA */}
			<div className="mt-8 p-6 bg-base-100 rounded-xl border-2 border-dashed border-primary/20 text-center">
				<h3 className="text-xl font-bold mb-2">
					{tLanding("demo.bottomCta.title")}
				</h3>
				<p className="text-base-content/70 mb-4">
					{tLanding("demo.bottomCta.subtitle")}
				</p>
				<button
					onClick={onLoginClick}
					className="btn btn-primary btn-lg"
				>
					{tLanding("demo.bottomCta.button")}
				</button>
			</div>
		</div>
	);
}
