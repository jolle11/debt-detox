"use client";

import { useState } from "react";
import type { Debt } from "@/lib/types";
import DemoDashboard from "./DemoDashboard";
import DemoDebtDetail from "./DemoDebtDetail";

interface DemoContainerProps {
	onLoginClick: () => void;
}

export default function DemoContainer({ onLoginClick }: DemoContainerProps) {
	const [currentView, setCurrentView] = useState<"dashboard" | "debt-detail">(
		"dashboard",
	);
	const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

	const handleDebtClick = (debt: Debt) => {
		setSelectedDebt(debt);
		setCurrentView("debt-detail");
	};

	const handleBackToDashboard = () => {
		setCurrentView("dashboard");
		setSelectedDebt(null);
	};

	if (currentView === "debt-detail" && selectedDebt) {
		return (
			<DemoDebtDetail
				debt={selectedDebt}
				onBack={handleBackToDashboard}
				onLoginClick={onLoginClick}
			/>
		);
	}

	return (
		<DemoDashboard
			onLoginClick={onLoginClick}
			onDebtClick={handleDebtClick}
		/>
	);
}
