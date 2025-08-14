"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import AuthModal from "@/components/auth/AuthModal";
import LanguageSelector from "@/components/language-selector";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
	const t = useTranslations();
	const { user, logout } = useAuth();
	const [showAuthModal, setShowAuthModal] = useState(false);

	return (
		<>
			<header className="bg-base-200 shadow-lg">
				<div className="navbar container mx-auto">
					<div className="flex-1">
						<h1 className="btn btn-ghost text-xl font-bold">
							{t("nav.title")}
						</h1>
					</div>
					<div className="flex-none flex items-center gap-2">
						<LanguageSelector />
						{user ? (
							<>
								<button className="btn btn-primary btn-sm">
									+ {t("nav.addDebt")}
								</button>
								<div className="dropdown dropdown-end">
									<div
										tabIndex={0}
										role="button"
										className="btn btn-ghost btn-sm gap-2"
									>
										<div className="avatar placeholder">
											<div className="bg-primary text-primary-content rounded-full w-6 h-6">
												<span className="text-xs">
													{user.name
														? user.name
																.charAt(0)
																.toUpperCase()
														: user.email
																.charAt(0)
																.toUpperCase()}
												</span>
											</div>
										</div>
										<span className="hidden sm:inline truncate max-w-24">
											{user.name || user.email}
										</span>
									</div>
									<ul
										tabIndex={0}
										className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow"
									>
										<li className="menu-title">
											<span>{user.email}</span>
										</li>
										<li>
											<button
												onClick={logout}
												className="text-error"
											>
												<svg
													xmlns="http://www.w3.org/2000/svg"
													className="h-4 w-4"
													fill="none"
													viewBox="0 0 24 24"
													stroke="currentColor"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
													/>
												</svg>
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
				</div>
			</header>

			<AuthModal
				isOpen={showAuthModal}
				onClose={() => setShowAuthModal(false)}
			/>
		</>
	);
}
