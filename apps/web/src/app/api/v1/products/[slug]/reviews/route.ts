import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { slugSchema } from "@/lib/validation";
import * as reviewService from "@/services/review.service";
import * as productService from "@/services/product.service";

const CACHE_HEADERS: Record<string, string> = {
  "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=120",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      return errorResponse("Invalid product slug");
    }
    const productId = await productService.getProductIdBySlug(slug);
    const reviews = await reviewService.getProductReviews(productId);
    return successResponse(reviews, "Success", 200, CACHE_HEADERS);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch reviews", [], 500);
  }
}
