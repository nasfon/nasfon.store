import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import * as productService from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    if (!q || q.trim().length === 0) {
      return errorResponse("Search query is required", ["q is required"]);
    }

    const result = await productService.searchProducts(q.trim(), page, limit);
    return successResponse(result, undefined, undefined, {
      "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Search failed", [], 500);
  }
}