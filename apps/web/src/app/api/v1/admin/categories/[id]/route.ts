import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminCategoryUpdateSchema } from "@/lib/validation";
import * as categoriesService from "@/services/admin/categories.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = adminCategoryUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const category = await categoriesService.updateCategory(id, parsed.data);
    return successResponse(category, "Category updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update category", [], 400);
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
    await categoriesService.deleteCategory(id);
    return successResponse(null, "Category deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete category", [], 400);
  }
}
