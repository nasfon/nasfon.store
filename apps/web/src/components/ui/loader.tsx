import { Spinner } from "@/components/ui/spinner";

interface DotsLoaderProps {
  className?: string;
  dotClassName?: string;
}

/** Modern animated bouncing-dots loader. */
export function DotsLoader({ className = "", dotClassName = "" }: DotsLoaderProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-2 w-2 rounded-full bg-primary animate-loader-dot ${dotClassName}`}
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}

interface ProgressLoaderProps {
  className?: string;
}

/** Slim indeterminate progress bar, ideal for refetch/filter states. */
export function ProgressLoader({ className = "" }: ProgressLoaderProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative block h-1 w-full overflow-hidden rounded-full bg-gray-100 ${className}`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary animate-loader-sweep"
      />
    </span>
  );
}

interface LoaderOverlayProps {
  label?: string;
  /** When true the overlay is full-screen and blocks interaction (used in modals). */
  fullPage?: boolean;
}

/**
 * Modern mobile-friendly loading overlay. Blurs the page behind it and shows
 * a bouncing-dots loader so users know an API call is in progress.
 */
export function LoaderOverlay({ label, fullPage = true }: LoaderOverlayProps) {
  return (
    <div
      aria-live="polite"
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-white/70 backdrop-blur-sm ${
        fullPage ? "" : "rounded-lg"
      }`}
    >
      <Spinner size={40} className="text-primary" />
      <p className="flex items-center gap-3 text-sm font-medium text-gray-600">
        <DotsLoader />
        {label ?? "Loading..."}
      </p>
    </div>
  );
}