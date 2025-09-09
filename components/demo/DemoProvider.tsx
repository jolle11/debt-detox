"use client";

import { createContext, useContext, type ReactNode } from "react";
import { mockDebts, mockPayments } from "@/lib/mock-data";
import type { Debt, Payment } from "@/lib/types";

interface DemoContextType {
	debts: Debt[];
	payments: Payment[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
	isDemoMode: boolean;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
	const demoValue: DemoContextType = {
		debts: mockDebts,
		payments: mockPayments,
		isLoading: false,
		error: null,
		refetch: () => {},
		isDemoMode: true,
	};

	return (
		<DemoContext.Provider value={demoValue}>
			{children}
		</DemoContext.Provider>
	);
}

export function useDemoContext() {
	const context = useContext(DemoContext);
	if (context === undefined) {
		throw new Error("useDemoContext must be used within a DemoProvider");
	}
	return context;
}