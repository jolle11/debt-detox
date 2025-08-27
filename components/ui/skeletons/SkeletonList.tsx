import SkeletonCard from "./SkeletonCard";

interface SkeletonListProps {
	count?: number;
	className?: string;
}

export default function SkeletonList({
	count = 3,
	className = "",
}: SkeletonListProps) {
	return (
		<div className={`space-y-4 ${className}`}>
			{Array.from({ length: count }).map((_, index) => (
				<SkeletonCard key={index} />
			))}
		</div>
	);
}
