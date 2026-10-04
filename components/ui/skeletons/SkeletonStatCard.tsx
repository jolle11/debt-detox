import Skeleton from "./Skeleton";

interface SkeletonStatCardProps {
	className?: string;
}

export default function SkeletonStatCard({
	className = "",
}: SkeletonStatCardProps) {
	return (
		<div
			className={`min-w-0 bg-base-100 rounded-xl border border-base-300 p-3 sm:p-4 lg:p-5 ${className}`}
		>
			<Skeleton className="h-4 w-20 mb-2" />
			<Skeleton className="h-6 w-16 mb-1" />
			<Skeleton className="h-3 w-24" />
		</div>
	);
}
