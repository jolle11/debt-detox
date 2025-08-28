"use client";

import { useQuery } from "@tanstack/react-query";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

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
	const {
		data: debts = [],
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["debts"],
		queryFn: fetchDebts,
		enabled: pb.authStore.isValid, // Solo ejecuta si está autenticado
	});

	return {
		debts,
		isLoading,
		error: error?.message || null,
		refetch,
	};
}
