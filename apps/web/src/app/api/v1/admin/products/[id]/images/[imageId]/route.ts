import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { uuidSchema, productImageUpdateSchema } from "@/lib/validation";
import * as productsService from "@/services/admin/products.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id, imageId } = await params;
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) return errorResponse("Invalid product ID");
    const parsedImageId = uuidSchema.safeParse(imageId);
    if (!parsedImageId.success) return errorResponse("Invalid image ID");

    const body = await request.json();
    const parsed = productImageUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const image = await productsService.updateProductImage(id, imageId, parsed.data);
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
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) return errorResponse("Invalid product ID");
    const parsedImageId = uuidSchema.safeParse(imageId);
    if (!parsedImageId.success) return errorResponse("Invalid image ID");

    await productsService.deleteProductImage(id, imageId);
    return successResponse(null, "Image deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete image", [], 400);
  }
}
