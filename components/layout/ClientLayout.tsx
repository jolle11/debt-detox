"use client";

import SessionGuard from "@/components/auth/SessionGuard";
import Header from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthSync } from "@/hooks/useAuthSync";

interface ClientLayoutProps {
	children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
	const { user, loading } = useAuth();

	// Sync queries with auth state changes
	useAuthSync();

	// Show loading state while checking auth
	if (loading) {
		return (
			<div className="min-h-screen bg-base-200 flex items-center justify-center">
				<div className="loading loading-spinner loading-lg text-primary"></div>
			</div>
		);
	}

	// If user is authenticated, show the normal app layout
	if (user) {
		return (
			<div className="min-h-screen bg-base-200">
				<Header />
				<main className="container mx-auto p-4">{children}</main>
				<SessionGuard />
			</div>
		);
	}

	// If no user, show children directly (landing page)
	return <>{children}</>;
}
