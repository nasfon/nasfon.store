import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { uuidSchema, productImageSchema } from "@/lib/validation";
import * as productsService from "@/services/admin/products.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    const parsed = uuidSchema.safeParse(id);
    if (!parsed.success) return errorResponse("Invalid product ID");

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
    const parsedId = uuidSchema.safeParse(id);
    if (!parsedId.success) return errorResponse("Invalid product ID");

    const body = await request.json();
    const parsed = productImageSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const image = await productsService.addProductImage(id, {
      image_url: parsed.data.image_url,
      display_order: parsed.data.display_order ?? 0,
    });

    return successResponse(image, "Image added", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to add image", [], 400);
  }
}
