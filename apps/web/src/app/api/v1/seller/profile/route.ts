import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import * as sellerService from "@/services/seller.service";

export async function GET(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const seller = await sellerService.getSellerProfile(user.id);
    return successResponse(seller);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch seller profile", [], 404);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const seller = await sellerService.updateSellerProfile(user.id, body);
    return successResponse(seller, "Seller profile updated successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update seller profile", [], 400);
  }
}
