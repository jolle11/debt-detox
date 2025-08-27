import Skeleton from "./Skeleton";
import SkeletonList from "./SkeletonList";

interface SkeletonDebtsListProps {
	className?: string;
}

export default function SkeletonDebtsList({
	className = "",
}: SkeletonDebtsListProps) {
	return (
		<div className={`card bg-base-100 shadow ${className}`}>
			<div className="card-body p-5">
				<Skeleton className="h-6 w-48 mb-4" />

				<div className="flex space-x-2 mb-6">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-10 w-20 rounded-full"
						/>
					))}
				</div>

				<SkeletonList count={3} />
			</div>
		</div>
	);
}
