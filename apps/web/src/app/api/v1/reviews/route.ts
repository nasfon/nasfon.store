import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser, withRateLimit } from "@/lib/api";
import { reviewSchema } from "@/lib/validation";
import * as reviewService from "@/services/review.service";
import { sanitizePlainText } from "@/lib/sanitize";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "review");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    if (body.review) {
      body.review = sanitizePlainText(body.review, 2000);
    }

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const review = await reviewService.createReview({
      ...parsed.data,
      user_id: user.id,
    });

    return successResponse(review, "Review created successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create review", [], 400);
  }
}
