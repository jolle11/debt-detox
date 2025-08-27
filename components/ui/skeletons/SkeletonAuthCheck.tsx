import SkeletonSummaryStats from "./SkeletonSummaryStats";
import SkeletonDebtsList from "./SkeletonDebtsList";

interface SkeletonAuthCheckProps {
	className?: string;
}

export default function SkeletonAuthCheck({ className = "" }: SkeletonAuthCheckProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			<SkeletonSummaryStats />
			<SkeletonDebtsList />
		</div>
	);
}