"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SpinnerIcon, UserPlusIcon } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import { type RegisterFormData, registerSchema } from "@/lib/schemas";

interface RegisterFormProps {
	onToggleForm?: () => void;
	onSuccess?: () => void;
}

export default function RegisterForm({
	onToggleForm,
	onSuccess,
}: RegisterFormProps) {
	const [loading, setLoading] = useState(false);

	const { register: registerUser } = useAuth();
	const t = useTranslations("auth.register");
	const tv = useTranslations("validation");
	const toast = useToast();

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
	});

	const onSubmit = async (data: RegisterFormData) => {
		setLoading(true);

		try {
			await registerUser(
				data.email,
				data.password,
				data.passwordConfirm,
				data.name,
			);
			toast.success("registerSuccess");
			onSuccess?.();
		} catch (err: any) {
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
							<span className="label-text font-medium">{t("name")}</span>
							<span className="label-text-alt text-xs text-base-content/60">
								{t("nameOptional")}
							</span>
						</label>
						<input
							type="text"
							placeholder={t("name")}
							className="input input-bordered w-full focus:input-primary"
							{...register("name")}
						/>
					</div>
					<div className="form-control">
						<label className="label">
							<span className="label-text font-medium">{t("email")}</span>
						</label>
						<input
							type="email"
							placeholder="tu@email.com"
							className={`input input-bordered w-full focus:input-primary ${errors.email ? "input-error" : ""}`}
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
							{...register("password")}
						/>
						{errors.password && (
							<label className="label py-1">
								<span className="label-text-alt text-error">
									{tv("minLength", { min: 8 })}
								</span>
							</label>
						)}
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
							className={`input input-bordered w-full focus:input-primary ${errors.passwordConfirm ? "input-error" : ""}`}
							{...register("passwordConfirm")}
						/>
						{errors.passwordConfirm && (
							<label className="label py-1">
								<span className="label-text-alt text-error">
									{tv("passwordMismatch")}
								</span>
							</label>
						)}
					</div>
				</div>

				<button
					type="submit"
					className="btn btn-primary w-full"
					disabled={loading}
				>
					{loading ? (
						<>
							<SpinnerIcon size={20} className="animate-spin mr-2" />
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
