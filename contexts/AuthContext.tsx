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
import type { DebtSortKey, SortDirection } from "@/lib/debtSorting";
import pb from "@/lib/pocketbase";

interface UserPreferencesUpdate {
	hide_amounts?: boolean;
	debt_sort_by?: DebtSortKey;
	debt_sort_direction?: SortDirection;
}

interface AuthContextType {
	user: RecordModel | null;
	setHideAmounts: (hidden: boolean) => Promise<void>;
	savingPrivacy: boolean;
	savingPreferences: boolean;
	savePreferences: (updates: UserPreferencesUpdate) => Promise<void>;
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
	const [savingPreferences, setSavingPreferences] = useState(false);
	const preferenceSaveInFlight = useRef(false);
	const preferenceRevision = useRef(0);

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
			const revision = preferenceRevision.current;
			if (
				document.visibilityState !== "visible" ||
				!userId ||
				preferenceSaveInFlight.current
			)
				return;
			try {
				const updated = await pb.collection("users").getOne(userId);
				if (
					pb.authStore.record?.id === userId &&
					!preferenceSaveInFlight.current &&
					revision === preferenceRevision.current
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

	const savePreferences = async (updates: UserPreferencesUpdate) => {
		const userId = pb.authStore.record?.id;
		if (!userId || preferenceSaveInFlight.current)
			throw new Error("Preferences cannot be saved now");
		preferenceSaveInFlight.current = true;
		preferenceRevision.current += 1;
		setSavingPreferences(true);
		try {
			const updated = await pb.collection("users").update(userId, updates);
			if (
				Object.entries(updates).some(([key, value]) => updated[key] !== value)
			)
				throw new Error("Preferences were not saved");
			if (pb.authStore.record?.id === userId)
				pb.authStore.save(pb.authStore.token, updated);
		} finally {
			preferenceSaveInFlight.current = false;
			setSavingPreferences(false);
		}
	};

	const setHideAmounts = (hidden: boolean) =>
		savePreferences({ hide_amounts: hidden });

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
		savingPrivacy: savingPreferences,
		savingPreferences,
		savePreferences,
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
