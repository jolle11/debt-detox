"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Toaster } from "sonner";
import SessionGuard from "@/components/auth/SessionGuard";
import Header from "@/components/layout/Header";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DebtsProvider } from "@/contexts/DebtsContext";
import { useAuthSync } from "@/hooks/useAuthSync";
import { makeQueryClient } from "@/lib/query-client";

interface ClientLayoutProps {
	children: React.ReactNode;
}

function AppLayout({ children }: ClientLayoutProps) {
	const { user, loading } = useAuth();
	const pathname = usePathname();
	const isPublicLandingRoute =
		pathname !== null &&
		/^\/(?:(es|en|fr|de|pt|nl))?\/?$/.test(pathname);

	// Sync queries with auth state changes
	useAuthSync();

	// Keep the landing indexable and visible while auth initializes.
	if (isPublicLandingRoute) {
		return <>{children}</>;
	}

	// Show loading state while checking auth for protected app routes.
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

export default function ClientLayout({ children }: ClientLayoutProps) {
	const [queryClient] = useState(() => makeQueryClient());

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<DebtsProvider>
					<AppLayout>{children}</AppLayout>
					<Toaster
						position="bottom-right"
						richColors
						closeButton
						toastOptions={{
							style: {
								fontFamily:
									"var(--font-inconsolata), Inconsolata, ui-sans-serif, system-ui, sans-serif",
							},
						}}
					/>
				</DebtsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
