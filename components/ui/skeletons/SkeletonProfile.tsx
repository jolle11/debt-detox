import Skeleton from "./Skeleton";

interface SkeletonProfileProps {
	className?: string;
}

export default function SkeletonProfile({
	className = "",
}: SkeletonProfileProps) {
	return (
		<div className={`max-w-2xl mx-auto ${className}`}>
			<div className="card bg-base-100 shadow-xl">
				<div className="card-body gap-0 p-5 sm:p-6">
					<div className="mb-3 flex items-center gap-3">
						<Skeleton className="h-12 w-12 shrink-0 rounded-full" />
						<div className="min-w-0 space-y-2">
							<Skeleton className="h-6 w-40 max-w-full" />
							<Skeleton className="h-4 w-48 max-w-full" />
						</div>
					</div>
					<div className="space-y-5">
						{[2, 3, 1].map((rows, index) => (
							<div key={index}>
								<Skeleton className="mb-1 h-3 w-32" />
								<div className="divide-y divide-base-200">
									{Array.from({ length: rows }).map((_, rowIndex) => (
										<div
											key={rowIndex}
											className="flex items-center justify-between gap-4 py-3"
										>
											<div className="min-w-0 space-y-2">
												<Skeleton className="h-3 w-20" />
												<Skeleton className="h-4 w-44 max-w-full" />
											</div>
											<Skeleton className="h-8 w-16 shrink-0 rounded" />
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
