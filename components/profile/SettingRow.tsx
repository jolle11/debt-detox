import type { ReactNode } from "react";

interface SettingRowProps {
	label: string;
	description?: ReactNode;
	htmlFor?: string;
	labelId?: string;
	children: ReactNode;
}

export default function SettingRow({
	label,
	description,
	htmlFor,
	labelId,
	children,
}: SettingRowProps) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
			<div className="min-w-0">
				{htmlFor ? (
					<label htmlFor={htmlFor} id={labelId} className="text-sm">
						{label}
					</label>
				) : (
					<p id={labelId} className="text-sm">
						{label}
					</p>
				)}
				{description && (
					<p className="mt-0.5 text-xs text-base-content/60">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}
