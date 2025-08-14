"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import pb from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

interface AuthContextType {
	user: RecordModel | null;
	login: (email: string, password: string) => Promise<void>;
	register: (email: string, password: string, passwordConfirm: string, name?: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<RecordModel | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// Check if user is already authenticated
		setUser(pb.authStore.model);
		setLoading(false);

		// Listen for auth changes
		pb.authStore.onChange(() => {
			setUser(pb.authStore.model);
		});
	}, []);

	const login = async (email: string, password: string) => {
		try {
			const authData = await pb.collection("users").authWithPassword(email, password);
			setUser(authData.record);
		} catch (error) {
			console.error("Login failed:", error);
			throw error;
		}
	};

	const register = async (email: string, password: string, passwordConfirm: string, name?: string) => {
		try {
			const userData = {
				email,
				password,
				passwordConfirm,
				...(name && { name })
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

	const value = {
		user,
		login,
		register,
		logout,
		loading
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}