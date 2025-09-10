import SkeletonDebtsList from "./SkeletonDebtsList";
import SkeletonSummaryStats from "./SkeletonSummaryStats";

interface SkeletonAuthCheckProps {
	className?: string;
}

export default function SkeletonAuthCheck({
	className = "",
}: SkeletonAuthCheckProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			<SkeletonSummaryStats />
			<SkeletonDebtsList />
		</div>
	);
}
