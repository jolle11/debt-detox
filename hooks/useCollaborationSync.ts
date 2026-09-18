"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";

export function useCollaborationSync() {
	const { user } = useAuth();
	const client = useQueryClient();
	useEffect(() => {
		if (!user?.id) return;
		let disposed = false;
		const unsubscribers: (() => void)[] = [];
		const refresh = () => {
			if (disposed) return;
			for (const key of ["debts", "payments", "invitations"])
				void client.invalidateQueries({ queryKey: [key] });
		};
		for (const collection of ["debts", "payments", "debt_invitations"]) {
			void pb
				.collection(collection)
				.subscribe("*", refresh)
				.then((unsubscribe) => {
					if (disposed) unsubscribe();
					else unsubscribers.push(unsubscribe);
				})
				.catch(() => {
					/* Polling below also covers reconnects and revoked access. */
				});
		}
		const interval = setInterval(() => {
			if (document.visibilityState === "visible") refresh();
		}, 30000);
		return () => {
			disposed = true;
			clearInterval(interval);
			unsubscribers.forEach((unsubscribe) => unsubscribe());
		};
	}, [user?.id, client]);
}
