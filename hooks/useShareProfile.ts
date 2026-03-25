"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import pb from "@/lib/pocketbase";
import type { SharedProfile } from "@/lib/types";
import { COLLECTIONS } from "@/lib/types";

export type ExpiresIn = "24h" | "7d" | "30d" | "never";

interface ShareProfileOptions {
	expiresIn: ExpiresIn;
	showAmounts: boolean;
	showDebtList: boolean;
	showCompleted: boolean;
}

function getExpirationDate(expiresIn: ExpiresIn): string {
	if (expiresIn === "never") {
		return new Date("9999-12-31T23:59:59.999Z").toISOString();
	}
	const now = new Date();
	switch (expiresIn) {
		case "24h":
			now.setHours(now.getHours() + 24);
			break;
		case "7d":
			now.setDate(now.getDate() + 7);
			break;
		case "30d":
			now.setDate(now.getDate() + 30);
			break;
	}
	return now.toISOString();
}

export function useShareProfile() {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(false);
	const [activeLinks, setActiveLinks] = useState<SharedProfile[]>([]);
	const [isLoadingLinks, setIsLoadingLinks] = useState(false);

	const createShareLink = async (
		options: ShareProfileOptions,
	): Promise<string> => {
		if (!user) throw new Error("Missing user");

		setIsLoading(true);
		try {
			const token = crypto.randomUUID();
			await pb.collection(COLLECTIONS.SHARED_PROFILES).create({
				token,
				user_id: user.id,
				expires_at: getExpirationDate(options.expiresIn),
				show_amounts: options.showAmounts,
				show_debt_list: options.showDebtList,
				show_completed: options.showCompleted,
			});

			const baseUrl = window.location.origin;
			return `${baseUrl}/share/profile/${token}`;
		} finally {
			setIsLoading(false);
		}
	};

	const fetchActiveLinks = async () => {
		if (!user) return;

		setIsLoadingLinks(true);
		try {
			const records = await pb
				.collection(COLLECTIONS.SHARED_PROFILES)
				.getFullList({
					filter: `user_id = "${user.id}" && deleted = null && expires_at > @now`,
					sort: "-created",
				});
			setActiveLinks(records as unknown as SharedProfile[]);
		} catch {
			setActiveLinks([]);
		} finally {
			setIsLoadingLinks(false);
		}
	};

	const revokeLink = async (id: string) => {
		await pb.collection(COLLECTIONS.SHARED_PROFILES).update(id, {
			deleted: new Date().toISOString(),
		});
		setActiveLinks((prev) => prev.filter((link) => link.id !== id));
	};

	return {
		createShareLink,
		fetchActiveLinks,
		revokeLink,
		activeLinks,
		isLoading,
		isLoadingLinks,
	};
}
