import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import * as productService from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return errorResponse("Search query is required", ["q is required"]);
    }

    const products = await productService.searchProducts(q.trim());
    return successResponse(products);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Search failed", [], 500);
  }
}
