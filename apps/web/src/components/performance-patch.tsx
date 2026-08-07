"use client";

import { useEffect } from "react";

/**
 * Dev-only guard for an upstream Next.js/React Turbopack bug
 * (vercel/next.js#86060): React's performance instrumentation calls
 * `performance.measure()` with a negative timestamp when a route is
 * rejected/aborted before its children render (e.g. an early `redirect()` /
 * `notFound()` guard). This throws in the browser and shows a misleading dev
 * overlay even though the page works fine. It never happens in production.
 */
export function PerformancePatch() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    const perf = window.performance;
    if (!perf || typeof perf.measure !== "function" || (perf as any).__patched) return;

    const original = perf.measure.bind(perf);
    (perf as any).__originalMeasure = original;
    (perf as any).measure = function (...args: Parameters<typeof perf.measure>) {
      try {
        return original.apply(perf, args);
      } catch (err: any) {
        const message: string = (err?.message as string) || "";
        if (message.includes("negative time stamp") || message.includes("cannot be negative")) {
          return;
        }
        throw err;
      }
    };
    (perf as any).__patched = true;
  }, []);

  return null;
}