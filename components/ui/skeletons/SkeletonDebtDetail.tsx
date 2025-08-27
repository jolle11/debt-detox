import Skeleton from "./Skeleton";

interface SkeletonDebtDetailProps {
	className?: string;
}

export default function SkeletonDebtDetail({
	className = "",
}: SkeletonDebtDetailProps) {
	return (
		<div className={`container mx-auto px-4 py-6 ${className}`}>
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<Skeleton className="h-8 w-16 rounded" />
					<div>
						<Skeleton className="h-6 w-48 mb-2" />
						<Skeleton className="h-4 w-32" />
					</div>
				</div>
				<Skeleton className="h-6 w-20 rounded-full" />
			</div>

			{/* Stats Row */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
				{Array.from({ length: 4 }).map((_, index) => (
					<div
						key={index}
						className="bg-base-100 rounded-xl border border-base-300 p-4"
					>
						<Skeleton className="h-4 w-16 mb-2" />
						<Skeleton className="h-6 w-20 mb-1" />
					</div>
				))}
			</div>

			{/* Main Content */}
			<div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
				<div className="xl:col-span-3 space-y-4">
					{/* Progress Section */}
					<div className="card bg-base-100 shadow-sm">
						<div className="card-body p-4">
							<Skeleton className="h-6 w-32 mb-4" />
							<Skeleton className="h-2 w-full rounded-full mb-3" />
							<Skeleton className="h-8 w-24 rounded-full" />
						</div>
					</div>

					{/* Details Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
						{Array.from({ length: 2 }).map((_, index) => (
							<div
								key={index}
								className="card bg-base-100 shadow"
							>
								<div className="card-body p-5">
									<Skeleton className="h-6 w-40 mb-4" />
									<div className="space-y-3">
										{Array.from({ length: 4 }).map(
											(_, i) => (
												<div
													key={i}
													className="flex justify-between"
												>
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-4 w-16" />
												</div>
											),
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Payments List */}
					<div className="card bg-base-100 shadow">
						<div className="card-body p-5">
							<Skeleton className="h-6 w-32 mb-4" />
							<div className="space-y-3">
								{Array.from({ length: 3 }).map((_, index) => (
									<Skeleton
										key={index}
										className="h-12 w-full rounded"
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div className="space-y-6">
					<div className="card bg-base-100 shadow">
						<div className="card-body p-5">
							<Skeleton className="h-6 w-24 mb-4" />
							<div className="space-y-4">
								{Array.from({ length: 2 }).map((_, index) => (
									<div key={index}>
										<Skeleton className="h-4 w-32 mb-2" />
										<Skeleton className="h-5 w-40" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
