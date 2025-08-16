export function usePasswordValidation(t: (key: string) => string) {
	const validatePasswordChange = (
		newPassword: string,
		confirmPassword: string,
	): string | null => {
		if (newPassword !== confirmPassword) {
			return t("passwordMismatch") || "Passwords don't match";
		}
		return null;
	};

	return { validatePasswordChange };
}
