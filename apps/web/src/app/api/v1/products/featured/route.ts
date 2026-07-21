import { successResponse, errorResponse } from "@/lib/api";
import * as productService from "@/services/product.service";

export async function GET() {
  try {
    const products = await productService.getFeaturedProducts();
    return successResponse(products);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch featured products", [], 500);
  }
}
