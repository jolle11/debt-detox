import Skeleton from "./Skeleton";

interface SkeletonProfileProps {
	className?: string;
}

export default function SkeletonProfile({
	className = "",
}: SkeletonProfileProps) {
	return (
		<div className={`max-w-2xl mx-auto space-y-4 ${className}`}>
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body flex-row items-center gap-4 p-5 sm:p-6">
					<Skeleton className="h-16 w-16 shrink-0 rounded-full" />
					<div className="min-w-0 flex-1 space-y-2">
						<Skeleton className="h-6 w-40 max-w-full" />
						<Skeleton className="h-4 w-56 max-w-full" />
					</div>
					<Skeleton className="h-8 w-24 shrink-0 rounded" />
				</div>
			</div>
			{[4, 2, 2].map((rows, index) => (
				<div key={index} className="card bg-base-100 shadow-xl">
					<div className="card-body gap-0 p-5 sm:p-6">
						<Skeleton className="mb-1 h-3 w-32" />
						<div className="divide-y divide-base-200">
							{Array.from({ length: rows }).map((_, rowIndex) => (
								<div
									key={rowIndex}
									className="flex items-center justify-between gap-4 py-3"
								>
									<Skeleton className="h-4 w-36 max-w-full" />
									<Skeleton className="h-8 w-24 shrink-0 rounded" />
								</div>
							))}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
