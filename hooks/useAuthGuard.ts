"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface UseAuthGuardOptions {
	checkInterval?: number; // in milliseconds, default 5 minutes
	onSessionExpired?: () => void;
}

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
	const { 
		checkInterval = 5 * 60 * 1000, // 5 minutes
		onSessionExpired 
	} = options;
	
	const { user, isSessionValid, checkAuthStatus } = useAuth();
	const intervalRef = useRef<NodeJS.Timeout | null>(null);
	const lastActivityRef = useRef<number>(Date.now());
	const isCheckingRef = useRef<boolean>(false);

	// Update last activity time on user interaction
	const updateActivity = () => {
		lastActivityRef.current = Date.now();
	};

	// Check session validity periodically
	const performSessionCheck = useCallback(async () => {
		if (!user || isCheckingRef.current) return;
		
		isCheckingRef.current = true;
		try {
			const isValid = await isSessionValid();
			if (!isValid) {
				onSessionExpired?.();
			}
		} catch (error) {
			console.error("Session check failed:", error);
		} finally {
			isCheckingRef.current = false;
		}
	}, [user, isSessionValid, onSessionExpired]);

	// Check session when tab becomes visible (user returns to app)
	const handleVisibilityChange = useCallback(async () => {
		if (document.visibilityState === 'visible' && user) {
			const timeSinceLastActivity = Date.now() - lastActivityRef.current;
			// If more than 30 minutes have passed, check session
			if (timeSinceLastActivity > 30 * 60 * 1000) {
				await performSessionCheck();
			}
		}
	}, [user, performSessionCheck]);

	useEffect(() => {
		if (!user) return;

		// Set up periodic session check
		intervalRef.current = setInterval(performSessionCheck, checkInterval);

		// Listen for visibility changes (tab focus)
		document.addEventListener('visibilitychange', handleVisibilityChange);

		// Listen for user activity to update last activity time
		const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];
		activities.forEach(event => {
			document.addEventListener(event, updateActivity, { passive: true });
		});

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
			document.removeEventListener('visibilitychange', handleVisibilityChange);
			activities.forEach(event => {
				document.removeEventListener(event, updateActivity);
			});
		};
	}, [user, checkInterval, performSessionCheck, handleVisibilityChange]);

	return {
		checkSession: performSessionCheck,
	};
}