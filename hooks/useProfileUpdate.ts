"use client";

import type { RecordModel } from "pocketbase";
import { useState } from "react";
import { toast } from "sonner";
import pb from "@/lib/pocketbase";

interface UseProfileUpdateOptions {
	user: RecordModel;
	refreshUser?: () => Promise<void>;
	successMessage?: string;
	errorMessage?: string;
}

export function useProfileUpdate({
	user,
	refreshUser,
	successMessage = "Updated successfully!",
	errorMessage = "Failed to update",
}: UseProfileUpdateOptions) {
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleUpdate = async (updateData: Record<string, any>) => {
		setLoading(true);

		try {
			await pb
				.collection(user?.collectionName || "users")
				.update(user?.id, updateData);

			if (refreshUser) {
				await refreshUser();
			}

			toast.success(successMessage);
			setIsEditing(false);
			return true;
		} catch (error: any) {
			toast.error(error?.message || errorMessage);
			return false;
		} finally {
			setLoading(false);
		}
	};

	const startEditing = () => setIsEditing(true);

	const cancelEditing = () => setIsEditing(false);

	return {
		isEditing,
		loading,
		handleUpdate,
		startEditing,
		cancelEditing,
	};
}
