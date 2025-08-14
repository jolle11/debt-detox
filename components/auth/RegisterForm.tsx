"use client";

import { SpinnerIcon, UserPlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface RegisterFormProps {
	onToggleForm?: () => void;
	onSuccess?: () => void;
}

export default function RegisterForm({
	onToggleForm,
	onSuccess,
}: RegisterFormProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { register } = useAuth();
	const t = useTranslations("auth.register");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		if (password !== passwordConfirm) {
			setError(t("passwordMismatch"));
			return;
		}

		setLoading(true);

		try {
			await register(email, password, passwordConfirm, name);
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
								{t("name")}
							</span>
							<span className="label-text-alt text-xs text-base-content/60">
								{t("nameOptional")}
							</span>
						</label>
						<input
							type="text"
							placeholder={t("name")}
							className="input input-bordered w-full focus:input-primary"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>
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
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">
								{t("confirmPassword")}
							</span>
						</label>
						<input
							type="password"
							placeholder="••••••••"
							className="input input-bordered w-full focus:input-primary"
							value={passwordConfirm}
							onChange={(e) => setPasswordConfirm(e.target.value)}
							required
						/>
					</div>
				</div>

				{error && (
					<div className="alert alert-error">
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
							<UserPlusIcon size={20} className="mr-2" />
							{t("submit")}
						</>
					)}
				</button>

				{onToggleForm && (
					<div className="text-center">
						<span className="text-sm text-base-content/70">
							{t("hasAccount")}{" "}
						</span>
						<button
							type="button"
							className="link link-primary link-hover text-sm font-medium"
							onClick={onToggleForm}
						>
							{t("signInLink")}
						</button>
					</div>
				)}
			</form>
		</div>
	);
}
