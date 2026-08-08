import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import type { OrderStatus } from "@/types";

const steps: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Order Placed" },
  { status: "payment_confirmed", label: "Payment Confirmed" },
  { status: "processing", label: "Processing" },
  { status: "ready_for_delivery", label: "Ready for Delivery" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

interface OrderTimelineProps {
  currentStatus: OrderStatus;
}

const statusOrder: OrderStatus[] = [
  "pending",
  "payment_confirmed",
  "processing",
  "ready_for_delivery",
  "out_for_delivery",
  "delivered",
];

export function OrderTimeline({ currentStatus }: OrderTimelineProps) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  const isCancelled = currentStatus === "cancelled";

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isDelivered = currentStatus === "delivered";
        const isCompleted = index < currentIndex || isDelivered;
        const isCurrent = index === currentIndex && !isDelivered;
        const isActive = isCompleted || isCurrent;

        return (
          <div key={step.status} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {isCompleted ? (
                <CheckCircle2 size={22} className="text-success" />
              ) : isCurrent && !isCancelled ? (
                <Loader2 size={22} className="animate-spin text-primary" />
              ) : isCancelled && isCurrent ? (
                <Circle size={22} className="text-error" />
              ) : (
                <Circle size={22} className="text-gray-300" />
              )}
              {index < steps.length - 1 && (
                <div
                  className={`mt-1 h-8 w-0.5 ${
                    isCompleted ? "bg-success" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className={`pt-0.5 ${isActive ? "text-gray-900" : "text-gray-400"}`}>
              <p className="text-sm font-medium">{step.label}</p>
              {isCurrent && !isCancelled && (
                <p className="text-xs text-gray-500">In progress</p>
              )}
              {isCancelled && isCurrent && (
                <p className="text-xs text-error">Order cancelled</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
