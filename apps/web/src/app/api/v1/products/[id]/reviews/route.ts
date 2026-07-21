import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import * as reviewService from "@/services/review.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await reviewService.getProductReviews(id);
    return successResponse(reviews);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch reviews", [], 500);
  }
}
