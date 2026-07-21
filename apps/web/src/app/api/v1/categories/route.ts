import { successResponse, errorResponse } from "@/lib/api";
import * as categoryService from "@/services/category.service";

export async function GET() {
  try {
    const categories = await categoryService.getCategories();
    return successResponse(categories);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch categories", [], 500);
  }
}
