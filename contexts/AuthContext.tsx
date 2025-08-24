"use client";

import type { RecordModel } from "pocketbase";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import pb from "@/lib/pocketbase";

interface AuthContextType {
	user: RecordModel | null;
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

	useEffect(() => {
		// Check authentication status on mount
		checkAuthStatus();

		// Listen for auth changes
		pb.authStore.onChange(() => {
			setUser(pb.authStore.model);
		});
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const authData = await pb
				.collection("users")
				.authWithPassword(email, password);
			setUser(authData.record);
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

			const record = await pb.collection("users").create(userData);

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
				const updatedUser = await pb
					.collection("users")
					.getOne(user.id);
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
		login,
		register,
		logout,
		loading,
		refreshUser,
		isSessionValid,
		checkAuthStatus,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
