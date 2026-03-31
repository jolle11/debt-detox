import { z } from "zod";

// --- Auth Schemas ---

export const loginSchema = z.object({
	email: z.string().min(1).email(),
	password: z.string().min(1),
});
export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
	.object({
		name: z.string().optional(),
		email: z.string().min(1).email(),
		password: z.string().min(8),
		passwordConfirm: z.string().min(8),
	})
	.refine((data) => data.password === data.passwordConfirm, {
		path: ["passwordConfirm"],
	});
export type RegisterFormData = z.infer<typeof registerSchema>;

// --- Debt Schemas ---

export const createDebtSchema = z.object({
	name: z.string().min(1).max(100),
	entity: z.string().min(1).max(100),
	down_payment: z.coerce.number().min(0).optional(),
	first_payment_date: z.string().min(1),
	monthly_amount: z.coerce.number().positive(),
	number_of_payments: z.coerce.number().int().positive(),
	final_payment: z.coerce.number().min(0).optional(),
	final_payment_date: z.string().optional(),
});
export type CreateDebtFormData = z.infer<typeof createDebtSchema>;

export const editDebtSchema = createDebtSchema;
export type EditDebtFormData = z.infer<typeof editDebtSchema>;

// --- Extra Payment Schema ---

export const extraPaymentSchema = z.object({
	amount: z.coerce.number().positive(),
	strategy: z.enum(["none", "reduce_installments", "reduce_amount"]),
});
export type ExtraPaymentFormData = z.infer<typeof extraPaymentSchema>;

// --- Profile Schemas ---

export const nameSchema = z.object({
	name: z.string().max(100),
});
export type NameFormData = z.infer<typeof nameSchema>;

export const passwordChangeSchema = z
	.object({
		currentPassword: z.string().min(1),
		newPassword: z.string().min(8),
		confirmPassword: z.string().min(8),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
	});
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>;

export const currencySchema = z.object({
	currency: z.string().min(1),
});
export type CurrencyFormData = z.infer<typeof currencySchema>;
