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
    const { order_status } = body;

    if (!order_status) {
      return errorResponse("Order status is required", [], 400);
    }

    const order = await sellerDashboardService.updateSellerOrderStatus(seller.id, id, order_status);
    return successResponse(order, "Order status updated successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update order status", [], 400);
  }
}
