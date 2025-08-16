"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import CreateDebtModal from "@/components/debt/CreateDebtModal";
import LanguageSelector from "@/components/language-selector";
import MobileMenu from "@/components/layout/MobileMenu";
import MobileMenuButton from "@/components/layout/MobileMenuButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import UserAvatar from "@/components/ui/UserAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useDebtsContext } from "@/contexts/DebtsContext";

export default function Header() {
	const t = useTranslations();
	const { user, logout } = useAuth();
	const { refetch } = useDebtsContext();
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [showCreateDebtModal, setShowCreateDebtModal] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	return (
		<>
			<header className="bg-base-200 shadow-lg">
				<div className="navbar container mx-auto">
					<div className="flex-1">
						<Link
							href="/"
							className="btn btn-ghost text-xl font-bold"
						>
							{t("nav.title")}
						</Link>
					</div>

					{/* Desktop Navigation */}
					<div className="flex-none hidden md:flex items-center gap-2">
						<LanguageSelector />
						{user ? (
							<>
								<button
									className="btn btn-primary btn-sm"
									onClick={() => setShowCreateDebtModal(true)}
								>
									+ {t("nav.addDebt")}
								</button>
								<div className="dropdown dropdown-end">
									<div
										tabIndex={0}
										role="button"
										className="btn btn-ghost btn-sm gap-2"
									>
										<UserAvatar user={user} size="sm" />
										<span className="hidden sm:inline truncate max-w-24">
											{user.name || user.email}
										</span>
									</div>
									<ul
										tabIndex={0}
										className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-xl border-2 border-primary/20"
									>
										<li className="menu-title">
											<span className="font-bold text-primary text-sm">
												{user.email}
											</span>
										</li>
										<li>
											<Link
												href="/profile"
												className="font-medium hover:bg-primary hover:text-white active:bg-primary/90 transition-all duration-200 hover:scale-[1.02]"
											>
												{t("nav.profile") || "Profile"}
											</Link>
										</li>
										<li>
											<button
												onClick={logout}
												className="text-error font-bold hover:bg-error hover:text-white active:bg-error/90 transition-all duration-200 hover:scale-[1.02]"
											>
												<SignOutIcon className="h-4 w-4" />
												{t("auth.logout")}
											</button>
										</li>
									</ul>
								</div>
							</>
						) : (
							<button
								className="btn btn-primary btn-sm"
								onClick={() => setShowAuthModal(true)}
							>
								{t("auth.loginButton")}
							</button>
						)}
						<ThemeToggle />
					</div>

					<MobileMenuButton
						isOpen={isMobileMenuOpen}
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
					/>
				</div>

				<MobileMenu
					isOpen={isMobileMenuOpen}
					onClose={() => setIsMobileMenuOpen(false)}
					onAuthModalOpen={() => setShowAuthModal(true)}
					onCreateDebtModalOpen={() => setShowCreateDebtModal(true)}
				/>
			</header>

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>

			<CreateDebtModal
				isOpen={showCreateDebtModal}
				onClose={() => setShowCreateDebtModal(false)}
				onSuccess={() => {
					refetch();
				}}
			/>
		</>
	);
}
