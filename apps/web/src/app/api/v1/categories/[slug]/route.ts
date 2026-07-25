import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { slugSchema } from "@/lib/validation";
import * as categoryService from "@/services/category.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const parsed = slugSchema.safeParse(slug);
    if (!parsed.success) {
      return errorResponse("Invalid category slug");
    }
    const result = await categoryService.getCategoryBySlug(slug);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Category not found", [], 404);
  }
}
