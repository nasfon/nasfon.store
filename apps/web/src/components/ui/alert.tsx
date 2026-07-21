import { type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from "lucide-react";
import { type VariantProps, cva } from "class-variance-authority";

const alertVariants = cva(
  "relative flex items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        success: "border-success/20 bg-success/5 text-success",
        warning: "border-warning/20 bg-warning/5 text-warning",
        error: "border-error/20 bg-error/5 text-error",
        info: "border-info/20 bg-info/5 text-info",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  }
);

const icons = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
  info: Info,
};

interface AlertProps extends VariantProps<typeof alertVariants> {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({ children, variant, onClose, className }: AlertProps) {
  const Icon = icons[variant ?? "info"];

  return (
    <div className={alertVariants({ variant, className })}>
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="flex-1">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-full p-0.5 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
