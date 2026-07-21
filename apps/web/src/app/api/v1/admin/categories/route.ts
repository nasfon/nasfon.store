import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminCategorySchema } from "@/lib/validation";
import * as categoriesService from "@/services/admin/categories.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const categories = await categoriesService.getAdminCategories();
    return successResponse(categories);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch categories", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = adminCategorySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const category = await categoriesService.createCategory(parsed.data);
    return successResponse(category, "Category created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create category", [], 400);
  }
}
