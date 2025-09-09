"use client";

import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

interface UseDebtsReturn {
	debts: Debt[];
	isLoading: boolean;
	error: string | null;
	refetch: () => void;
}

const fetchDebts = async (): Promise<Debt[]> => {
	if (!pb.authStore.isValid) {
		return [];
	}

	try {
		const records = await pb.collection(COLLECTIONS.DEBTS).getFullList({
			filter: "deleted = null",
			sort: "-created",
		});

		return records as unknown as Debt[];
	} catch (err) {
		const errorMessage =
			err instanceof Error ? err.message : "Error al cargar las deudas";
		console.error("Error fetching debts:", err);
		throw new Error(errorMessage);
	}
};

export function useDebts(): UseDebtsReturn {
	const { user } = useAuth();
	
	const {
		data: debts = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["debts", user?.id], // Include user ID in query key
		queryFn: fetchDebts,
		enabled: !!user, // Solo ejecuta si hay usuario autenticado
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});

	return {
		debts,
		isLoading,
		error: error?.message || null,
		refetch,
	};
}
