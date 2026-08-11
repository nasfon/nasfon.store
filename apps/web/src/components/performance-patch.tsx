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
type MeasureFunction = typeof performance.measure;

type PatchedPerformance = Performance & {
  __patched?: boolean;
  __originalMeasure?: MeasureFunction;
};

export function PerformancePatch() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (typeof window === "undefined") return;

    const perf = window.performance as PatchedPerformance;
    if (!perf || typeof perf.measure !== "function" || perf.__patched) return;

    const original = perf.measure.bind(perf);
    perf.__originalMeasure = original;
    perf.measure = ((...args: Parameters<MeasureFunction>): PerformanceMeasure => {
      try {
        return original.apply(perf, args);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("negative time stamp") || message.includes("cannot be negative")) {
          return undefined as unknown as PerformanceMeasure;
        }
        throw err;
      }
    }) as typeof perf.measure;
    perf.__patched = true;
  }, []);

  return null;
}