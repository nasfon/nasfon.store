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

    const locations = await sellerDashboardService.getSellerDeliveryLocations(seller.id);
    return successResponse(locations);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch delivery locations", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const seller = await sellerService.getSellerProfile(user.id);
    if (!seller || seller.verification_status !== "approved") {
      return errorResponse("Approved seller profile required", [], 403);
    }

    const body = await request.json();
    const location = await sellerDashboardService.createSellerDeliveryLocation(seller.id, body);
    return successResponse(location, "Delivery location created successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create delivery location", [], 400);
  }
}
