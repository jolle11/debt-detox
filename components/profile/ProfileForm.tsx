import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface ProfileFormProps {
	title: string;
	isEditing: boolean;
	loading: boolean;
	onEdit: () => void;
	onSubmit: (e: React.FormEvent) => void;
	onCancel: () => void;
	editButtonText?: string;
	submitButtonText?: string;
	children: ReactNode;
	displayContent?: ReactNode;
}

export default function ProfileForm({
	title,
	isEditing,
	loading,
	onEdit,
	onSubmit,
	onCancel,
	editButtonText,
	submitButtonText,
	children,
	displayContent,
}: ProfileFormProps) {
	const t = useTranslations("profile");

	return (
		<>
			<div className="divider">{title}</div>

			{!isEditing ? (
				<div className="space-y-4">
					{displayContent}
					<button className="btn btn-outline btn-sm" onClick={onEdit}>
						{editButtonText || t("edit") || "Edit"}
					</button>
				</div>
			) : (
				<form onSubmit={onSubmit} className="space-y-6">
					{children}

					<div className="flex gap-3 pt-2">
						<button
							type="submit"
							className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
							disabled={loading}
						>
							{submitButtonText || t("save") || "Save"}
						</button>
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={onCancel}
						>
							{t("cancel") || "Cancel"}
						</button>
					</div>
				</form>
			)}
		</>
	);
}
