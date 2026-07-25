import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { uuidSchema, adminProductUpdateSchema } from "@/lib/validation";
import { sanitizeName, sanitizePlainText } from "@/lib/sanitize";
import * as productsService from "@/services/admin/products.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) return errorResponse("Invalid product ID");

    const body = await request.json();
    const parsed = adminProductUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const sanitized = {
      ...parsed.data,
      ...(parsed.data.name !== undefined ? { name: sanitizeName(parsed.data.name) } : {}),
      ...(parsed.data.description !== undefined ? { description: sanitizePlainText(parsed.data.description || "", 2000) } : {}),
    };

    const product = await productsService.updateProduct(id, sanitized);
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
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) return errorResponse("Invalid product ID");
    await productsService.deleteProduct(id);
    return successResponse(null, "Product deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete product", [], 400);
  }
}
