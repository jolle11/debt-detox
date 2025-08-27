import Skeleton from "./Skeleton";

interface SkeletonTextProps {
	className?: string;
	lines?: number;
}

export default function SkeletonText({
	className = "",
	lines = 1,
}: SkeletonTextProps) {
	if (lines === 1) {
		return <Skeleton className={`h-4 ${className}`} />;
	}

	return (
		<div className={`space-y-2 ${className}`}>
			{Array.from({ length: lines }).map((_, index) => (
				<Skeleton
					key={index}
					className={`h-4 ${index === lines - 1 ? "w-3/4" : "w-full"}`}
				/>
			))}
		</div>
	);
}
