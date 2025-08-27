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
				<div className="card-body">
					{/* Profile Header */}
					<div className="flex items-center space-x-4 mb-6">
						<Skeleton className="h-16 w-16 rounded-full" />
						<div className="space-y-2">
							<Skeleton className="h-6 w-48" />
							<Skeleton className="h-4 w-32" />
						</div>
					</div>

					{/* Settings Sections */}
					<div className="space-y-6">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={index}
								className="card bg-base-200 border border-base-300"
							>
								<div className="card-body p-4">
									<Skeleton className="h-5 w-32 mb-4" />
									<div className="space-y-3">
										<Skeleton className="h-10 w-full rounded" />
										<Skeleton className="h-9 w-24 rounded" />
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
