import SkeletonStatCard from "./SkeletonStatCard";

interface SkeletonSummaryStatsProps {
	className?: string;
}

export default function SkeletonSummaryStats({
	className = "",
}: SkeletonSummaryStatsProps) {
	return (
		<div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
			{Array.from({ length: 4 }).map((_, index) => (
				<SkeletonStatCard key={index} />
			))}
		</div>
	);
}
