import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminProductSchema } from "@/lib/validation";
import * as productsService from "@/services/admin/products.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const products = await productsService.getAdminProducts();
    return successResponse(products);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch products", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const parsed = adminProductSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const product = await productsService.createProduct(parsed.data);
    return successResponse(product, "Product created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create product", [], 400);
  }
}
