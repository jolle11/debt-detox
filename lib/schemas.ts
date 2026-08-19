import { z } from "zod";
import { calculateNumberOfPayments } from "./debtDates";

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

const debtFields = {
	name: z.string().min(1).max(100),
	entity: z.string().min(1).max(100),
	down_payment: z.coerce.number().min(0).optional(),
	first_payment_date: z.string().min(1),
	monthly_amount: z.coerce.number().positive(),
	is_shared: z.boolean().default(false),
	number_of_payments: z.preprocess(
		(value) => (value === "" || value == null ? undefined : value),
		z.coerce.number().int().positive().optional(),
	),
	final_payment: z.coerce.number().min(0).optional(),
	final_payment_date: z.string().optional(),
};

export const createDebtSchema = z
	.object(debtFields)
	.superRefine((data, ctx) => {
		if (!data.number_of_payments && !data.final_payment_date) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["number_of_payments"],
				message: "A payment count or final payment date is required",
			});
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["final_payment_date"],
				message: "A payment count or final payment date is required",
			});
		}

		if (data.first_payment_date && data.final_payment_date) {
			try {
				const calculatedPayments = calculateNumberOfPayments({
					first_payment_date: data.first_payment_date,
					final_payment_date: data.final_payment_date,
					final_payment: data.final_payment,
				});

				if (
					data.number_of_payments &&
					data.number_of_payments !== calculatedPayments
				) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						path: ["number_of_payments"],
						message: "Payment count does not match the payment dates",
					});
				}
			} catch {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["final_payment_date"],
					message: "Final payment date must follow first payment date",
				});
			}
		}
	});
export type CreateDebtFormData = z.infer<typeof createDebtSchema>;

export const editDebtSchema = z.object({
	...debtFields,
	number_of_payments: z.coerce.number().int().positive(),
});
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
