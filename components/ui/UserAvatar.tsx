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
		sm: "w-6 h-6 text-xs",
		md: "w-8 h-8 text-sm",
	};

	const initial = user.name
		? user.name.charAt(0).toUpperCase()
		: user.email?.charAt(0).toUpperCase() || "U";

	return (
		<div className="avatar placeholder">
			<div
				className={`bg-primary text-primary-content rounded-full ${sizeClasses[size]}`}
			>
				<span className={size === "sm" ? "text-xs" : "text-sm"}>
					{initial}
				</span>
			</div>
		</div>
	);
}
