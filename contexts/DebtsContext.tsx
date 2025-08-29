"use client";

import { createContext, type ReactNode, useContext } from "react";
import { useDebts } from "@/hooks/useDebts";
import type { Debt } from "@/lib/types";

interface DebtsContextType {
	debts: Debt[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

const DebtsContext = createContext<DebtsContextType | undefined>(undefined);

export function DebtsProvider({ children }: { children: ReactNode }) {
	const debtsState = useDebts();

	return (
		<DebtsContext.Provider value={debtsState}>
			{children}
		</DebtsContext.Provider>
	);
}

export function useDebtsContext() {
	const context = useContext(DebtsContext);
	if (context === undefined) {
		throw new Error("useDebtsContext must be used within a DebtsProvider");
	}
	return context;
}
