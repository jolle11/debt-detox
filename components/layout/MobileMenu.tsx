"use client";

import { SignOutIcon, ShareNetwork } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSwipe } from "@/hooks/useSwipe";
import UserAvatar from "../ui/UserAvatar";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onOpen: () => void;
	onAuthModalOpen: () => void;
	onCreateDebtModalOpen: () => void;
	onShareProfileModalOpen: () => void;
}

export default function MobileMenu({
	isOpen,
	onClose,
	onOpen,
	onAuthModalOpen,
	onCreateDebtModalOpen,
	onShareProfileModalOpen,
}: MobileMenuProps) {
	const t = useTranslations();
	const { user, logout } = useAuth();

	useSwipe({
		onSwipeLeft: onOpen,
		onSwipeRight: isOpen ? onClose : undefined,
		threshold: 50,
		edgeSize: 30,
	});

	const handleLogout = () => {
		logout();
		onClose();
	};

	const handleAuthModalOpen = () => {
		onAuthModalOpen();
		onClose();
	};

	const handleCreateDebtModalOpen = () => {
		onCreateDebtModalOpen();
		onClose();
	};

	const handleShareProfileModalOpen = () => {
		onShareProfileModalOpen();
		onClose();
	};

	return (
		<>
			{/* Overlay */}
			<div
				className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={onClose}
			/>

			{/* Drawer */}
			<div
				className={`md:hidden fixed top-0 right-0 h-full w-72 bg-base-200 z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
					isOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="flex flex-col h-full p-4 overflow-y-auto">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<span className="text-lg font-bold">
							{t("nav.title")}
						</span>
						<button
							className="btn btn-ghost btn-sm btn-square"
							onClick={onClose}
						>
							✕
						</button>
					</div>

					{/* Language & Theme */}
					<div className="flex items-center justify-between mb-4">
						<LanguageSelector />
						<ThemeToggle />
					</div>

					{user ? (
						<div className="space-y-3 flex-1">
							<div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
								<UserAvatar user={user} size="md" />
								<div className="flex-1 min-w-0">
									<div className="font-semibold truncate">
										{user.name || user.email}
									</div>
									<div className="text-xs text-base-content/70 truncate">
										{user.email}
									</div>
								</div>
							</div>

							<button
								className="btn btn-primary w-full"
								onClick={handleCreateDebtModalOpen}
							>
								+ {t("nav.addDebt")}
							</button>

							<Link
								href="/profile"
								className="btn btn-outline w-full"
								onClick={onClose}
							>
								{t("nav.profile") || "Profile"}
							</Link>

							<button
								className="btn btn-outline w-full gap-2"
								onClick={handleShareProfileModalOpen}
							>
								<ShareNetwork className="w-4 h-4" />
								{t("shareProfile.title")}
							</button>

							{/* Spacer to push logout to bottom */}
							<div className="flex-1" />

							<button
								onClick={handleLogout}
								className="btn btn-outline btn-error w-full mt-auto"
							>
								<SignOutIcon className="h-4 w-4" />
								{t("auth.logout")}
							</button>
						</div>
					) : (
						<button
							className="btn btn-primary w-full"
							onClick={handleAuthModalOpen}
						>
							{t("auth.loginButton")}
						</button>
					)}
				</div>
			</div>
		</>
	);
}
