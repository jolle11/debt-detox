"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import type { DebtInvitation } from "@/lib/types";

export function useCollaboration(debtId?: string) {
	const { user } = useAuth();
	const client = useQueryClient();
	const query = useQuery({
		queryKey: ["invitations", user?.id, debtId],
		enabled: !!user?.id,
		queryFn: () =>
			pb.collection<DebtInvitation>("debt_invitations").getFullList({
				filter: debtId
					? pb.filter("debt_id = {:id}", { id: debtId })
					: pb.filter(
							"recipient_id = {:id} && status = 'pending' && expires_at > @now",
							{ id: user!.id },
						),
				sort: "-created",
			}),
	});
	const mutation = useMutation({
		mutationFn: ({
			url,
			method,
			body,
		}: {
			url: string;
			method: string;
			body?: Record<string, string>;
		}) => pb.send(url, { method, body }),
		onSuccess: async () => {
			await Promise.all(
				["invitations", "debts", "payments"].map((key) =>
					client.invalidateQueries({ queryKey: [key] }),
				),
			);
		},
	});
	return {
		invitations: query.data ?? [],
		isLoading: query.isLoading,
		error: query.error,
		isSaving: mutation.isPending,
		invite: (email: string) =>
			mutation.mutateAsync({
				url: `/api/debt-detox/debts/${debtId}/invite`,
				method: "POST",
				body: { email },
			}),
		respond: (id: string, action: "accept" | "reject" | "cancel") =>
			mutation.mutateAsync({
				url: `/api/debt-detox/invitations/${id}/respond`,
				method: "POST",
				body: { action },
			}),
		remove: () =>
			mutation.mutateAsync({
				url: `/api/debt-detox/debts/${debtId}/collaborator`,
				method: "DELETE",
			}),
	};
}
