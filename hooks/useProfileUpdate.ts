"use client";

import type { RecordModel } from "pocketbase";
import { useState } from "react";
import pb from "@/lib/pocketbase";

interface UseProfileUpdateOptions {
	user: RecordModel;
	onMessage: (message: { type: string; text: string }) => void;
	refreshUser?: () => Promise<void>;
	successMessage?: string;
	errorMessage?: string;
}

export function useProfileUpdate({
	user,
	onMessage,
	refreshUser,
	successMessage = "Updated successfully!",
	errorMessage = "Failed to update",
}: UseProfileUpdateOptions) {
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);

	const handleUpdate = async (
		updateData: Record<string, any>,
		customValidation?: () => string | null,
	) => {
		setLoading(true);
		onMessage({ type: "", text: "" });

		// Run custom validation if provided
		if (customValidation) {
			const validationError = customValidation();
			if (validationError) {
				onMessage({ type: "error", text: validationError });
				setLoading(false);
				return false;
			}
		}

		try {
			await pb
				.collection(user?.collectionName || "users")
				.update(user?.id, updateData);

			if (refreshUser) {
				await refreshUser();
			}

			onMessage({
				type: "success",
				text: successMessage,
			});
			setIsEditing(false);
			return true;
		} catch (error: any) {
			onMessage({
				type: "error",
				text: error?.message || errorMessage,
			});
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
