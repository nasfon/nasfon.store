import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import * as productService from "@/services/product.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await productService.getProductBySlug(slug);
    return successResponse(product);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Product not found", [], 404);
  }
}
