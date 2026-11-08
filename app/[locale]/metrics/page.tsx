"use client";

import MetricsDashboard from "@/components/metrics/MetricsDashboard";
import SkeletonDebtsList from "@/components/ui/skeletons/SkeletonDebtsList";
import SkeletonSummaryStats from "@/components/ui/skeletons/SkeletonSummaryStats";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function MetricsPage() {
	const { user, loading } = useAuthRedirect();

	if (loading) {
		return (
			<div className="space-y-4">
				<SkeletonSummaryStats />
				<SkeletonDebtsList />
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return <MetricsDashboard />;
}
