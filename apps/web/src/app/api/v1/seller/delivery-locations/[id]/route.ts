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
    const location = await sellerDashboardService.updateSellerDeliveryLocation(seller.id, id, body);
    return successResponse(location, "Delivery location updated successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update delivery location", [], 400);
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
    await sellerDashboardService.deleteSellerDeliveryLocation(seller.id, id);
    return successResponse(null, "Delivery location deleted successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete delivery location", [], 400);
  }
}
