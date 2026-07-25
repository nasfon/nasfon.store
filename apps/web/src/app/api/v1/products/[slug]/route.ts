import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { slugSchema } from "@/lib/validation";
import * as productService from "@/services/product.service";

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
    const product = await productService.getProductBySlug(slug);
    return successResponse(product);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Product not found", [], 404);
  }
}
