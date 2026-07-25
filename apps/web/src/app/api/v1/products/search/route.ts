import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { searchQuerySchema } from "@/lib/validation";
import { sanitizeSearchQuery } from "@/lib/sanitize";
import * as productService from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = searchQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const { q, page, limit } = parsed.data;
    const sanitized = sanitizeSearchQuery(q);
    const result = await productService.searchProducts(sanitized, page, limit);
    return successResponse(result, undefined, undefined, {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Search failed", [], 500);
  }
}