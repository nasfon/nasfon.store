import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import * as sellerService from "@/services/seller.service";
import * as sellerDashboardService from "@/services/seller-dashboard.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const seller = await sellerService.getSellerProfile(user.id);
    if (!seller || seller.verification_status !== "approved") {
      return errorResponse("Approved seller profile required", [], 403);
    }

    const { id } = await params;
    const body = await request.json();
    const product = await sellerDashboardService.updateSellerProduct(seller.id, id, body);
    return successResponse(product, "Product updated successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update product", [], 400);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const seller = await sellerService.getSellerProfile(user.id);
    if (!seller || seller.verification_status !== "approved") {
      return errorResponse("Approved seller profile required", [], 403);
    }

    const { id } = await params;
    await sellerDashboardService.deleteSellerProduct(seller.id, id);
    return successResponse(null, "Product deleted successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete product", [], 400);
  }
}
