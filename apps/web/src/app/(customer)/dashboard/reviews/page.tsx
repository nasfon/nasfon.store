"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useOrders } from "@/hooks/use-orders";
import { useCreateReview } from "@/hooks/use-reviews";
import { toast } from "sonner";

export default function ReviewsPage() {
  const { data: orders } = useOrders();
  const createReview = useCreateReview();
  const [reviewForm, setReviewForm] = useState<Record<string, { rating: number; review: string }>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const deliveredOrders = orders?.filter((o) => o.order_status === "delivered") || [];

  const handleSubmit = (productId: string, orderId: string) => {
    const form = reviewForm[productId];
    if (!form || !form.rating) {
      toast.error("Please select a rating");
      return;
    }

    setSubmittingId(productId);

    createReview.mutate(
      {
        product_id: productId,
        order_id: orderId,
        rating: form.rating,
        review: form.review || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Review submitted");
          setReviewForm((prev) => {
            const next = { ...prev };
            delete next[productId];
            return next;
          });
          setSubmittingId(null);
        },
        onError: (err) => {
          toast.error(err.message);
          setSubmittingId(null);
        },
      }
    );
  };

  if (!deliveredOrders.length) {
    return (
      <EmptyState
        icon={<MessageSquare size={48} />}
        title="No reviews yet"
        description="You can review products after they've been delivered."
        action={<Button variant="outline" onClick={() => window.location.href = "/dashboard/orders"}>View Orders</Button>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>

      <div className="mt-4 space-y-4">
        {deliveredOrders.map((order) =>
          order.items?.map((item) => {
            const form = reviewForm[item.product_id] || { rating: 0, review: "" };
            return (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product?.name || "Product"}</p>
                    <p className="text-sm text-gray-500">Order: {order.order_number}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1">
                  <fieldset>
                    <legend className="sr-only">Rating for {item.product?.name || "product"}</legend>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() =>
                          setReviewForm((prev) => ({
                            ...prev,
                            [item.product_id]: { ...prev[item.product_id] || { rating: 0, review: "" }, rating: i + 1 },
                          }))
                        }
                        aria-label={`Rate ${i + 1} star${i === 0 ? "" : "s"}`}
                        aria-pressed={i < form.rating}
                      >
                        <Star
                          size={20}
                          aria-hidden="true"
                          className={
                            i < form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </fieldset>
                </div>

                <label htmlFor={`review-${item.product_id}`} className="sr-only">
                  Write your review for {item.product?.name || "this product"}
                </label>
                <textarea
                  id={`review-${item.product_id}`}
                  value={form.review}
                  onChange={(e) =>
                    setReviewForm((prev) => ({
                      ...prev,
                      [item.product_id]: { ...prev[item.product_id] || { rating: 0, review: "" }, review: e.target.value },
                    }))
                  }
                  className="mt-3 h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Write your review (optional)"
                />

                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => handleSubmit(item.product_id, order.id)}
                  loading={createReview.isPending && submittingId === item.product_id}
                >
                  {createReview.isPending && submittingId === item.product_id ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
