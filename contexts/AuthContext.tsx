"use client";

import type { RecordModel } from "pocketbase";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import pb from "@/lib/pocketbase";

interface AuthContextType {
	user: RecordModel | null;
	setHideAmounts: (hidden: boolean) => Promise<void>;
	savingPrivacy: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		password: string,
		passwordConfirm: string,
		name?: string,
	) => Promise<void>;
	logout: () => void;
	loading: boolean;
	refreshUser: () => Promise<void>;
	isSessionValid: () => Promise<boolean>;
	checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<RecordModel | null>(null);
	const [loading, setLoading] = useState(true);
	const [savingPrivacy, setSavingPrivacy] = useState(false);
	const privacySaveInFlight = useRef(false);
	const privacyRevision = useRef(0);

	useEffect(() => {
		// Check authentication status on mount
		checkAuthStatus();

		// Listen for auth changes
		return pb.authStore.onChange(() => {
			setUser(pb.authStore.model);
		});
	}, []);

	// Reload profile preferences when returning to a device with an existing session.
	useEffect(() => {
		const syncPreferences = async () => {
			const userId = pb.authStore.record?.id;
			const revision = privacyRevision.current;
			if (
				document.visibilityState !== "visible" ||
				!userId ||
				privacySaveInFlight.current
			)
				return;
			try {
				const updated = await pb.collection("users").getOne(userId);
				if (
					pb.authStore.record?.id === userId &&
					!privacySaveInFlight.current &&
					revision === privacyRevision.current
				) {
					pb.authStore.save(pb.authStore.token, updated);
				}
			} catch {
				// Keep the last saved preference when the device is offline.
			}
		};
		document.addEventListener("visibilitychange", syncPreferences);
		return () =>
			document.removeEventListener("visibilitychange", syncPreferences);
	}, []);

	const setHideAmounts = async (hidden: boolean) => {
		const userId = pb.authStore.record?.id;
		if (!userId || privacySaveInFlight.current) return;
		privacySaveInFlight.current = true;
		privacyRevision.current += 1;
		setSavingPrivacy(true);
		try {
			const updated = await pb
				.collection("users")
				.update(userId, { hide_amounts: hidden });
			if (updated.hide_amounts !== hidden)
				throw new Error("Privacy preference was not saved");
			if (pb.authStore.record?.id === userId)
				pb.authStore.save(pb.authStore.token, updated);
		} finally {
			privacySaveInFlight.current = false;
			setSavingPrivacy(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			await pb.collection("users").authWithPassword(email, password);
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const register = async (
		email: string,
		password: string,
		passwordConfirm: string,
		name?: string,
	) => {
		try {
			const userData = {
				email,
				password,
				passwordConfirm,
				...(name && { name }),
			};

			await pb.collection("users").create(userData);

			// Auto-login after registration
			await login(email, password);
		} catch (error) {
			console.error("Registration failed:", error);
			throw error;
		}
	};

	const logout = () => {
		pb.authStore.clear();
		setUser(null);
	};

	const refreshUser = async () => {
		if (user?.id) {
			try {
				const updatedUser = await pb.collection("users").getOne(user.id);
				setUser(updatedUser);
			} catch (error) {
				console.error("Failed to refresh user:", error);
			}
		}
	};

	const isSessionValid = async (): Promise<boolean> => {
		try {
			// If no token exists, session is invalid
			if (!pb.authStore.token || !pb.authStore.model) {
				return false;
			}

			// Try to refresh the authentication to check if token is still valid
			await pb.collection("users").authRefresh();
			return true;
		} catch (error) {
			// If refresh fails, token is expired or invalid
			console.warn("Session validation failed:", error);
			return false;
		}
	};

	const checkAuthStatus = async () => {
		setLoading(true);
		try {
			// First check if there's a stored auth state
			if (pb.authStore.model && pb.authStore.token) {
				// Validate if the session is still active
				const isValid = await isSessionValid();
				if (isValid) {
					setUser(pb.authStore.model);
				} else {
					// Session expired, clear auth state
					pb.authStore.clear();
					setUser(null);
				}
			} else {
				setUser(null);
			}
		} catch (error) {
			console.error("Auth status check failed:", error);
			// On error, clear auth state
			pb.authStore.clear();
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const value = {
		user,
		setHideAmounts,
		savingPrivacy,
		login,
		register,
		logout,
		loading,
		refreshUser,
		isSessionValid,
		checkAuthStatus,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
