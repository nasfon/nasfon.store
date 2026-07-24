import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as productsService from "@/services/admin/products.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const images = await productsService.getProductImages(id);
    return successResponse(images);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch images", [], 500);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    if (!body.image_url || typeof body.image_url !== "string") {
      return errorResponse("image_url is required");
    }

    const image = await productsService.addProductImage(id, {
      image_url: body.image_url,
      display_order: body.display_order ?? 0,
    });

    return successResponse(image, "Image added", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to add image", [], 400);
  }
}
