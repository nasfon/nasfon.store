import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import * as sellerService from "@/services/seller.service";
import * as sellerDashboardService from "@/services/seller-dashboard.service";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const seller = await sellerService.getSellerProfile(user.id);
    if (!seller || seller.verification_status !== "approved") {
      return errorResponse("Approved seller profile required", [], 403);
    }

    const orders = await sellerDashboardService.getSellerOrders(seller.id);
    return successResponse(orders);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch seller orders", [], 500);
  }
}
