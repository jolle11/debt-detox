interface SkeletonProps {
	className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
	return (
		<div
			className={`animate-pulse bg-base-300 rounded ${className}`}
			aria-hidden="true"
		/>
	);
}
