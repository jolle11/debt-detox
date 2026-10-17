import { useTranslations } from "next-intl";
import { type ReactNode, useId } from "react";

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
	const titleId = useId();
	const formId = useId();

	return (
		<div className="py-3">
			<div className="flex items-center justify-between gap-3 sm:gap-6">
				<div className="min-w-0">
					<p id={titleId} className="text-xs text-base-content/60">
						{title}
					</p>
					{!isEditing && displayContent && (
						<div className="mt-1 break-words text-sm">{displayContent}</div>
					)}
				</div>
				{!isEditing && (
					<button
						type="button"
						className="btn btn-outline btn-sm shrink-0"
						onClick={onEdit}
						aria-label={editButtonText || `${t("edit")} ${title}`}
					>
						{t("edit")}
					</button>
				)}
			</div>
			{isEditing && (
				<form
					id={formId}
					aria-labelledby={titleId}
					onSubmit={onSubmit}
					className="mt-3 space-y-3"
				>
					<fieldset disabled={loading} className="space-y-3">
						{children}
						<div className="flex flex-wrap gap-2 pt-1">
							<button
								type="submit"
								className="btn btn-primary btn-sm"
								disabled={loading}
							>
								{loading && (
									<span className="loading loading-spinner loading-xs" />
								)}
								{submitButtonText || t("save")}
							</button>
							<button
								type="button"
								className="btn btn-ghost btn-sm"
								onClick={onCancel}
							>
								{t("cancel")}
							</button>
						</div>
					</fieldset>
				</form>
			)}
		</div>
	);
}
