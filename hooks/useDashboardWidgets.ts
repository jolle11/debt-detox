"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
	type DashboardWidgetId,
	DEFAULT_DASHBOARD_WIDGETS,
	normalizeDashboardWidgets,
} from "@/lib/dashboardWidgets";
import pb from "@/lib/pocketbase";

export function useDashboardWidgets() {
	const { user, refreshUser } = useAuth();
	const [isSaving, setIsSaving] = useState(false);

	const widgets =
		user && Object.hasOwn(user, "dashboard_widgets")
			? normalizeDashboardWidgets(user.dashboard_widgets)
			: [...DEFAULT_DASHBOARD_WIDGETS];

	const saveWidgets = async (nextWidgets: DashboardWidgetId[]) => {
		if (!user?.id) return;
		setIsSaving(true);
		try {
			await pb.collection(user.collectionName || "users").update(user.id, {
				dashboard_widgets: nextWidgets,
			});
			await refreshUser();
		} finally {
			setIsSaving(false);
		}
	};

	return { widgets, saveWidgets, isSaving };
}
