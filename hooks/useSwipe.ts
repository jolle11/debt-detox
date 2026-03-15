"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseSwipeOptions {
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	threshold?: number;
	edgeSize?: number;
}

export function useSwipe({
	onSwipeLeft,
	onSwipeRight,
	threshold = 50,
	edgeSize = 30,
}: UseSwipeOptions) {
	const touchStartX = useRef(0);
	const touchStartY = useRef(0);
	const touchEndX = useRef(0);
	const touchEndY = useRef(0);
	const isSwiping = useRef(false);

	const handleTouchStart = useCallback(
		(e: TouchEvent) => {
			const touch = e.touches[0];
			touchStartX.current = touch.clientX;
			touchStartY.current = touch.clientY;
			touchEndX.current = touch.clientX;
			touchEndY.current = touch.clientY;

			// Only track swipes that start from the right edge (for opening)
			// or anywhere (for closing via onSwipeRight)
			const startedFromRightEdge =
				touch.clientX >= window.innerWidth - edgeSize;
			isSwiping.current = startedFromRightEdge || !!onSwipeRight;
		},
		[edgeSize, onSwipeLeft]
	);

	const handleTouchMove = useCallback((e: TouchEvent) => {
		if (!isSwiping.current) return;
		const touch = e.touches[0];
		touchEndX.current = touch.clientX;
		touchEndY.current = touch.clientY;
	}, []);

	const handleTouchEnd = useCallback(() => {
		if (!isSwiping.current) return;
		isSwiping.current = false;

		const deltaX = touchEndX.current - touchStartX.current;
		const deltaY = touchEndY.current - touchStartY.current;

		// Only trigger if horizontal movement is greater than vertical
		if (Math.abs(deltaX) < Math.abs(deltaY)) return;
		if (Math.abs(deltaX) < threshold) return;

		if (
			deltaX < 0 &&
			touchStartX.current >= window.innerWidth - edgeSize
		) {
			// Swiped left from right edge → open
			onSwipeLeft?.();
		} else if (deltaX > 0) {
			// Swiped right → close
			onSwipeRight?.();
		}
	}, [threshold, edgeSize, onSwipeLeft, onSwipeRight]);

	useEffect(() => {
		document.addEventListener("touchstart", handleTouchStart, {
			passive: true,
		});
		document.addEventListener("touchmove", handleTouchMove, {
			passive: true,
		});
		document.addEventListener("touchend", handleTouchEnd, {
			passive: true,
		});

		return () => {
			document.removeEventListener("touchstart", handleTouchStart);
			document.removeEventListener("touchmove", handleTouchMove);
			document.removeEventListener("touchend", handleTouchEnd);
		};
	}, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}
