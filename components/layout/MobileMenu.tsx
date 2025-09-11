"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import LanguageSelector from "@/components/LanguageSelector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "../ui/UserAvatar";

interface MobileMenuProps {
	isOpen: boolean;
	onClose: () => void;
	onAuthModalOpen: () => void;
	onCreateDebtModalOpen: () => void;
}

export default function MobileMenu({
	isOpen,
	onClose,
	onAuthModalOpen,
	onCreateDebtModalOpen,
}: MobileMenuProps) {
	const t = useTranslations();
	const { user, logout } = useAuth();

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

	return (
		<div
			className={`md:hidden bg-base-200 border-t border-base-300 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
		>
			<div className="container mx-auto p-4 space-y-4">
				<div className="flex items-center justify-between">
					<LanguageSelector />
					<ThemeToggle />
				</div>

				{user ? (
					<div className="space-y-3">
						<div className="flex items-center gap-3 p-3 bg-base-100 rounded-lg">
							<UserAvatar user={user} size="md" />
							<div className="flex-1">
								<div className="font-semibold">
									{user.name || user.email}
								</div>
								<div className="text-xs text-base-content/70">
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
							onClick={handleLogout}
							className="btn btn-outline btn-error w-full"
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
	);
}
