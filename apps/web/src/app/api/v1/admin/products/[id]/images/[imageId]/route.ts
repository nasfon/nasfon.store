import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as productsService from "@/services/admin/products.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id, imageId } = await params;
    const body = await request.json();

    const image = await productsService.updateProductImage(id, imageId, body);
    return successResponse(image, "Image updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update image", [], 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id, imageId } = await params;
    await productsService.deleteProductImage(id, imageId);
    return successResponse(null, "Image deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete image", [], 400);
  }
}
