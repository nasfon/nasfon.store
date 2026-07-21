import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { requireUser } from "@/lib/api";
import { reviewSchema } from "@/lib/validation";
import * as reviewService from "@/services/review.service";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const body = await request.json();
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
