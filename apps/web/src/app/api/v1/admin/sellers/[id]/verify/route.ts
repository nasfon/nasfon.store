import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as adminSellersService from "@/services/admin/sellers.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return errorResponse("Valid status (approved or rejected) is required", [], 400);
    }

    const seller = await adminSellersService.adminVerifySeller(id, status);
    return successResponse(seller, `Seller application ${status}`);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update seller verification", [], 400);
  }
}
