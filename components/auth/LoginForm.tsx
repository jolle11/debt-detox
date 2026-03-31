"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SignInIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { type LoginFormData, loginSchema } from "@/lib/schemas";

const MAX_ATTEMPTS_BEFORE_LOCKOUT = 3;
const BASE_LOCKOUT_SECONDS = 10;

interface LoginFormProps {
	onToggleForm?: () => void;
	onSuccess?: () => void;
}

export default function LoginForm({ onToggleForm, onSuccess }: LoginFormProps) {
	const [loading, setLoading] = useState(false);
	const [failedAttempts, setFailedAttempts] = useState(0);
	const [lockoutSeconds, setLockoutSeconds] = useState(0);
	const lockoutTimer = useRef<ReturnType<typeof setInterval> | null>(null);

	const { login } = useAuth();
	const t = useTranslations("auth.login");
	const tv = useTranslations("validation");
	const toast = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
	});

	// Countdown timer during lockout
	useEffect(() => {
		if (lockoutSeconds <= 0) return;

		lockoutTimer.current = setInterval(() => {
			setLockoutSeconds((prev) => {
				if (prev <= 1) {
					clearInterval(lockoutTimer.current!);
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => {
			if (lockoutTimer.current) clearInterval(lockoutTimer.current);
		};
	}, [lockoutSeconds]);

	const isLocked = lockoutSeconds > 0;

	const onSubmit = async (data: LoginFormData) => {
		if (isLocked) return;

		setLoading(true);

		try {
			await login(data.email, data.password);
			setFailedAttempts(0);
			toast.success("loginSuccess");
			onSuccess?.();
		} catch (err: any) {
			const newAttempts = failedAttempts + 1;
			setFailedAttempts(newAttempts);

			if (newAttempts >= MAX_ATTEMPTS_BEFORE_LOCKOUT) {
				const exponent = newAttempts - MAX_ATTEMPTS_BEFORE_LOCKOUT;
				const seconds = BASE_LOCKOUT_SECONDS * 2 ** exponent;
				setLockoutSeconds(seconds);
			}

			toast.error("genericError", err?.data?.message || t("error"));
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="w-full max-w-md mx-auto">
			<form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
				<div className="space-y-4">
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">{t("email")}</span>
						</label>
						<input
							type="email"
							placeholder="tu@email.com"
							className={`input input-bordered w-full focus:input-primary ${errors.email ? "input-error" : ""}`}
							disabled={isLocked}
							{...register("email")}
						/>
						{errors.email && (
							<label className="label py-1">
								<span className="label-text-alt text-error">{tv("email")}</span>
							</label>
						)}
					</div>
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">{t("password")}</span>
						</label>
						<input
							type="password"
							placeholder="••••••••"
							className={`input input-bordered w-full focus:input-primary ${errors.password ? "input-error" : ""}`}
							disabled={isLocked}
							{...register("password")}
						/>
						{errors.password && (
							<label className="label py-1">
								<span className="label-text-alt text-error">
									{tv("required")}
								</span>
							</label>
						)}
					</div>
				</div>

				{isLocked && (
					<div className="alert alert-warning">
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
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
							/>
						</svg>
						<span className="text-sm">
							{t("tooManyAttempts", {
								seconds: lockoutSeconds,
							})}
						</span>
					</div>
				)}

				<button
					type="submit"
					className="btn btn-primary w-full"
					disabled={loading || isLocked}
				>
					{loading ? (
						<>
							<SpinnerIcon size={20} className="animate-spin mr-2" />
							{t("submitting")}
						</>
					) : (
						<>
							<SignInIcon size={20} className="mr-2" />
							{isLocked ? `${lockoutSeconds}s` : t("submit")}
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
