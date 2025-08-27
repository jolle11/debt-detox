import Skeleton from "./Skeleton";

interface SkeletonHeaderProps {
	className?: string;
}

export default function SkeletonHeader({
	className = "",
}: SkeletonHeaderProps) {
	return (
		<div className={`flex justify-between items-center ${className}`}>
			<div className="flex items-center space-x-3">
				<Skeleton className="h-10 w-10 rounded-full" />
				<div className="space-y-2">
					<Skeleton className="h-5 w-32" />
					<Skeleton className="h-3 w-24" />
				</div>
			</div>
			<Skeleton className="h-9 w-9 rounded" />
		</div>
	);
}
