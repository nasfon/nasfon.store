import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as adminSellersService from "@/services/admin/sellers.service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const sellers = await adminSellersService.adminGetSellers({ status, search });
    return successResponse(sellers);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch sellers", [], 500);
  }
}
