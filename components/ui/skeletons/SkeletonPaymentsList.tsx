import Skeleton from "./Skeleton";

interface SkeletonPaymentsListProps {
	className?: string;
}

export default function SkeletonPaymentsList({
	className = "",
}: SkeletonPaymentsListProps) {
	return (
		<div className={`card bg-base-100 shadow-sm ${className}`}>
			<div className="card-body p-4">
				<div className="flex items-center justify-between mb-4">
					<Skeleton className="h-6 w-40" />
					<Skeleton className="h-4 w-24" />
				</div>

				{/* Summary stats */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="text-center p-2 bg-base-200 rounded-lg"
						>
							<Skeleton className="h-6 w-8 mx-auto mb-1" />
							<Skeleton className="h-3 w-12 mx-auto" />
						</div>
					))}
				</div>

				{/* Table skeleton */}
				<div className="overflow-x-auto">
					<table className="table table-sm">
						<thead>
							<tr>
								{Array.from({ length: 5 }).map((_, index) => (
									<th key={index}>
										<Skeleton className="h-4 w-20" />
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{Array.from({ length: 6 }).map((_, index) => (
								<tr key={index}>
									<td>
										<Skeleton className="h-4 w-24" />
									</td>
									<td>
										<Skeleton className="h-5 w-16 rounded-full" />
									</td>
									<td className="text-right">
										<Skeleton className="h-4 w-16 ml-auto" />
									</td>
									<td className="text-right">
										<Skeleton className="h-4 w-16 ml-auto" />
									</td>
									<td>
										<Skeleton className="h-4 w-20" />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
