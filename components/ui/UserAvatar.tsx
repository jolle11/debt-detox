import type { RecordModel } from "pocketbase";

interface UserAvatarProps {
	user: RecordModel & {
		name?: string;
		email?: string;
	};
	size?: "xs" | "sm" | "md";
}

export default function UserAvatar({ user, size = "sm" }: UserAvatarProps) {
	const sizeClasses = {
		xs: "w-6 h-6",
		sm: "w-8 h-8",
		md: "w-12 h-12",
	};

	const textClasses = {
		xs: "text-xs",
		sm: "text-sm",
		md: "text-lg",
	};

	const initial = user.name
		? user.name.charAt(0).toUpperCase()
		: user.email?.charAt(0).toUpperCase() || "U";

	return (
		<div
			className={`${sizeClasses[size]} bg-primary text-primary-content rounded-full shrink-0 flex items-center justify-center font-semibold`}
		>
			<span className={textClasses[size]}>{initial}</span>
		</div>
	);
}
