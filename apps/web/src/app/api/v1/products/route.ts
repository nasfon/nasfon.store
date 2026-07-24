import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { productQuerySchema } from "@/lib/validation";
import * as productService from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      search: searchParams.get("search") || undefined,
      category_id: searchParams.get("category_id") || undefined,
      featured: searchParams.get("featured") || undefined,
      sort: searchParams.get("sort") || undefined,
    };

    const parsed = productQuerySchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse("Invalid query parameters", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const result = await productService.getProducts(parsed.data);

    return successResponse(result, undefined, undefined, {
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch products", [], 500);
  }
}