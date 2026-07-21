import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminProductUpdateSchema } from "@/lib/validation";
import * as productsService from "@/services/admin/products.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = adminProductUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const product = await productsService.updateProduct(id, parsed.data);
    return successResponse(product, "Product updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update product", [], 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await productsService.deleteProduct(id);
    return successResponse(null, "Product deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete product", [], 400);
  }
}
