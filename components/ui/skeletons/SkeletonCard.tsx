import Skeleton from "./Skeleton";

interface SkeletonCardProps {
	className?: string;
}

export default function SkeletonCard({ className = "" }: SkeletonCardProps) {
	return (
		<div className={`card bg-base-100 shadow ${className}`}>
			<div className="card-body p-5">
				<div className="flex justify-between items-start">
					<div className="flex-1 space-y-3">
						<Skeleton className="h-6 w-48" />
						<Skeleton className="h-4 w-32" />
						<div className="space-y-2">
							<Skeleton className="h-4 w-full" />
							<Skeleton className="h-4 w-3/4" />
						</div>
						<div className="mt-4">
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
						<div className="mt-3">
							<Skeleton className="h-6 w-24 rounded-full" />
						</div>
					</div>
					<div className="ml-4">
						<Skeleton className="h-8 w-8 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
}
