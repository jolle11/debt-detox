"use client";

import { SignInIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
	onToggleForm?: () => void;
	onSuccess?: () => void;
}

export default function LoginForm({ onToggleForm, onSuccess }: LoginFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const t = useTranslations("auth.login");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			onSuccess?.();
		} catch (err: any) {
			setError(err?.data?.message || t("error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<form className="space-y-6" onSubmit={handleSubmit}>
				<div className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">
								{t("email")}
							</span>
						</label>
						<input
							type="email"
							placeholder="tu@email.com"
							className="input input-bordered w-full focus:input-primary"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</div>
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">
								{t("password")}
							</span>
						</label>
						<input
							type="password"
							placeholder="••••••••"
							className="input input-bordered w-full focus:input-primary"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>
				</div>

				{error && (
					<div className="alert alert-error">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="stroke-current shrink-0 h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="text-sm">{error}</span>
					</div>
				)}

				<button
					type="submit"
					className="btn btn-primary w-full"
					disabled={loading}
				>
					{loading ? (
						<>
							<SpinnerIcon
								size={20}
								className="animate-spin mr-2"
							/>
							{t("submitting")}
						</>
					) : (
						<>
							<SignInIcon size={20} className="mr-2" />
							{t("submit")}
						</>
					)}
				</button>

				{onToggleForm && (
					<div className="text-center">
						<span className="text-sm text-base-content/70">
							{t("noAccount")}{" "}
						</span>
						<button
							type="button"
							className="link link-primary link-hover text-sm font-medium"
							onClick={onToggleForm}
						>
							{t("signUpLink")}
						</button>
					</div>
				)}
			</form>
		</div>
	);
}
