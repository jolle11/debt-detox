"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	const [isLoginMode, setIsLoginMode] = useState(true);
	const tLogin = useTranslations("auth.login");
	const tRegister = useTranslations("auth.register");

	const toggleMode = () => {
		setIsLoginMode(!isLoginMode);
	};

	if (!isOpen) return null;

	return (
		<div className="modal modal-open">
			<div className="modal-box relative max-w-lg">
				<button
					className="btn btn-sm btn-circle absolute right-2 top-2 z-10"
					onClick={onClose}
				>
					✕
				</button>

				<div className="text-center mb-6">
					<h3 className="font-bold text-2xl mb-2">
						{isLoginMode ? tLogin("title") : tRegister("title")}
					</h3>
					<p className="text-base-content/70 text-sm">
						{isLoginMode
							? tLogin("subtitle")
							: tRegister("subtitle")}
					</p>
				</div>

				{isLoginMode ? (
					<LoginForm onToggleForm={toggleMode} onSuccess={onClose} />
				) : (
					<RegisterForm
						onToggleForm={toggleMode}
						onSuccess={onClose}
					/>
				)}
			</div>
			<div className="modal-backdrop" onClick={onClose}></div>
		</div>
	);
}
