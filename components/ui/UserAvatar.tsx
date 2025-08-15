import type { RecordModel } from "pocketbase";

interface UserAvatarProps {
	user: RecordModel & {
		name?: string;
		email?: string;
	};
	size?: "sm" | "md";
}

export default function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
	const sizeClasses = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
	};

	const textClasses = {
		sm: "text-sm",
		md: "text-lg",
	};

	const initial = user.name
		? user.name.charAt(0).toUpperCase()
		: user.email?.charAt(0).toUpperCase() || "U";

	return (
		<div
			className={`${sizeClasses[size]} bg-primary text-primary-content rounded-full flex items-center justify-center font-semibold`}
		>
			<span className={textClasses[size]}>
				{initial}
			</span>
		</div>
	);
}
