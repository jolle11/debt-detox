"use client";

import {
	ArrowDownIcon,
	ArrowUpIcon,
	DotsSixVerticalIcon,
	PlusIcon,
	XIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	DASHBOARD_WIDGET_IDS,
	type DashboardWidgetId,
	DEFAULT_DASHBOARD_WIDGETS,
} from "@/lib/dashboardWidgets";

interface Props {
	isOpen: boolean;
	widgets: DashboardWidgetId[];
	isSaving: boolean;
	onClose: () => void;
	onSave: (widgets: DashboardWidgetId[]) => Promise<void>;
}

export default function DashboardWidgetEditor({
	isOpen,
	widgets,
	isSaving,
	onClose,
	onSave,
}: Props) {
	const t = useTranslations("dashboard.customize");
	const tw = useTranslations("dashboard.widgets");
	const [draft, setDraft] = useState(widgets);
	const [dragged, setDragged] = useState<DashboardWidgetId | null>(null);

	useEffect(() => {
		if (isOpen) setDraft(widgets);
	}, [isOpen, widgets]);
	if (!isOpen) return null;

	const move = (index: number, offset: number) => {
		const nextIndex = index + offset;
		if (nextIndex < 0 || nextIndex >= draft.length) return;
		const next = [...draft];
		[next[index], next[nextIndex]] = [next[nextIndex], next[index]];
		setDraft(next);
	};
	const moveBefore = (target: DashboardWidgetId) => {
		if (!dragged || dragged === target) return;
		const next = draft.filter((id) => id !== dragged);
		next.splice(next.indexOf(target), 0, dragged);
		setDraft(next);
		setDragged(null);
	};
	const available = DASHBOARD_WIDGET_IDS.filter((id) => !draft.includes(id));

	return (
		<div
			className="modal modal-open"
			role="dialog"
			aria-modal="true"
			aria-labelledby="widget-editor-title"
		>
			<div className="modal-box max-w-2xl max-h-[90vh]">
				<div className="flex items-start justify-between gap-4">
					<div>
						<h2 id="widget-editor-title" className="text-xl font-bold">
							{t("title")}
						</h2>
						<p className="text-sm text-base-content/70 mt-1">
							{t("description")}
						</p>
					</div>
					<button
						type="button"
						className="btn btn-ghost btn-sm btn-circle"
						onClick={onClose}
						aria-label={t("close")}
					>
						<XIcon className="w-5 h-5" />
					</button>
				</div>
				<div className="mt-6">
					<h3 className="font-semibold">{t("selected")}</h3>
					{draft.length === 0 ? (
						<div className="border border-dashed border-base-300 rounded-xl p-6 text-center text-sm text-base-content/60 mt-3">
							{t("empty")}
						</div>
					) : (
						<ul className="space-y-2 mt-3">
							{draft.map((id, index) => (
								<li
									key={id}
									draggable
									onDragStart={() => setDragged(id)}
									onDragOver={(event) => event.preventDefault()}
									onDrop={() => moveBefore(id)}
									className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 p-2"
								>
									<DotsSixVerticalIcon
										className="w-5 h-5 text-base-content/40 cursor-grab shrink-0"
										aria-hidden="true"
									/>
									<span className="flex-1 text-sm font-medium">
										{tw(`${id}.title`)}
									</span>
									<button
										type="button"
										className="btn btn-ghost btn-xs btn-square"
										disabled={index === 0}
										onClick={() => move(index, -1)}
										aria-label={t("moveUp", { name: tw(`${id}.title`) })}
									>
										<ArrowUpIcon className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="btn btn-ghost btn-xs btn-square"
										disabled={index === draft.length - 1}
										onClick={() => move(index, 1)}
										aria-label={t("moveDown", { name: tw(`${id}.title`) })}
									>
										<ArrowDownIcon className="w-4 h-4" />
									</button>
									<button
										type="button"
										className="btn btn-ghost btn-xs btn-square text-error"
										onClick={() =>
											setDraft(draft.filter((widget) => widget !== id))
										}
										aria-label={t("remove", { name: tw(`${id}.title`) })}
									>
										<XIcon className="w-4 h-4" />
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
				<div className="mt-6">
					<h3 className="font-semibold">{t("available")}</h3>
					{available.length === 0 ? (
						<p className="text-sm text-base-content/60 mt-2">{t("allAdded")}</p>
					) : (
						<div className="grid sm:grid-cols-2 gap-2 mt-3">
							{available.map((id) => (
								<button
									key={id}
									type="button"
									className="flex items-start gap-3 rounded-lg border border-base-300 p-3 text-left hover:border-primary hover:bg-primary/5 transition-colors"
									onClick={() => setDraft([...draft, id])}
								>
									<PlusIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
									<span>
										<span className="block text-sm font-semibold">
											{tw(`${id}.title`)}
										</span>
										<span className="block text-xs text-base-content/60 mt-0.5">
											{tw(`${id}.catalogDescription`)}
										</span>
									</span>
								</button>
							))}
						</div>
					)}
				</div>
				<div className="modal-action justify-between gap-2">
					<button
						type="button"
						className="btn btn-ghost"
						onClick={() => setDraft([...DEFAULT_DASHBOARD_WIDGETS])}
					>
						{t("restore")}
					</button>
					<div className="flex gap-2">
						<button
							type="button"
							className="btn"
							disabled={isSaving}
							onClick={onClose}
						>
							{t("cancel")}
						</button>
						<button
							type="button"
							className="btn btn-primary"
							disabled={isSaving}
							onClick={() => onSave(draft)}
						>
							{isSaving ? (
								<span className="loading loading-spinner loading-sm" />
							) : null}
							{t("save")}
						</button>
					</div>
				</div>
			</div>
			<button
				type="button"
				className="modal-backdrop"
				onClick={onClose}
				aria-label={t("close")}
			>
				close
			</button>
		</div>
	);
}
