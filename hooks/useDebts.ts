"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { COLLECTIONS, type Debt } from "@/lib/types";

interface UseDebtsReturn {
	debts: Debt[];
	isLoading: boolean;
	error: string | null;
	refetch: () => Promise<void>;
}

export function useDebts(): UseDebtsReturn {
	const [debts, setDebts] = useState<Debt[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchDebts = async () => {
		setIsLoading(true);
		setError(null);

		try {
			if (!pb.authStore.isValid) {
				setDebts([]);
				return;
			}

			const records = await pb.collection(COLLECTIONS.DEBTS).getFullList({
				filter: "deleted = null",
				sort: "-created",
			});

			setDebts(records as Debt[]);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Error al cargar las deudas";
			setError(errorMessage);
			console.error("Error fetching debts:", err);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDebts();
	}, []);

	return {
		debts,
		isLoading,
		error,
		refetch: fetchDebts,
	};
}
