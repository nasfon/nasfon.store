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

    if (typeof body?.is_active !== "boolean") {
      return errorResponse("is_active (boolean) is required", [], 400);
    }

    const seller = await adminSellersService.adminSetSellerActive(id, body.is_active);
    return successResponse(seller, body.is_active ? "Seller activated" : "Seller deactivated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update seller", [], 400);
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
    await adminSellersService.adminDeleteSeller(id);
    return successResponse(null, "Seller deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete seller", [], 400);
  }
}