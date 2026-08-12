"use client";

import { useEffect, useRef, useState } from "react";

interface NavigationLike {
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

/**
 * Slim progress bar shown at the top of the screen while a route navigation
 * is in flight. Gives immediate feedback for every link click on mobile.
 *
 * Relies on the browser Navigation API (used by the App Router when
 * available). Degrades gracefully — per-page loaders still show feedback.
 */
export function RouteProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const nav = (window as unknown as { navigation?: NavigationLike }).navigation;
    if (!nav) return;

    const start = () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      setVisible(true);
      setProgress(14);
      timerRef.current = setInterval(() => {
        setProgress((current) => (current < 90 ? current + (90 - current) * 0.14 : 90));
      }, 180);
    };

    const done = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      setProgress(100);
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 280);
    };

    nav.addEventListener("navigate", start);
    nav.addEventListener("navigatesuccess", done);
    nav.addEventListener("navigateerror", done);

    return () => {
      nav.removeEventListener("navigate", start);
      nav.removeEventListener("navigatesuccess", done);
      nav.removeEventListener("navigateerror", done);
      if (timerRef.current) clearInterval(timerRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-1 overflow-hidden"
    >
      <div
        className="h-full rounded-r-full bg-gradient-to-r from-primary via-primary to-primary-hover transition-[width] duration-200 ease-out"
        style={{ width: `${progress}%`, boxShadow: "0 0 8px rgba(37, 99, 235, 0.5)" }}
      />
    </div>
  );
}