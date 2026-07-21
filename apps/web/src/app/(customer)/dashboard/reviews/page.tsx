import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function ReviewsPage() {
  const hasReviews = false;

  if (!hasReviews) {
    return (
      <EmptyState
        icon={<Star size={48} />}
        title="No reviews yet"
        description="Review products after they are delivered."
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
      <div className="mt-4 space-y-4">{/* reviews list */}</div>
    </div>
  );
}
