import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export function Spinner({ size = 24, className }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      aria-hidden="true"
      className={`animate-spin text-primary ${className ?? ""}`}
    />
  );
}
