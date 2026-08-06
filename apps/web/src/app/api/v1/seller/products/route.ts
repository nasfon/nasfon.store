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

    const products = await sellerDashboardService.getSellerProducts(seller.id);
    return successResponse(products);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch seller products", [], 500);
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
    const product = await sellerDashboardService.createSellerProduct(seller.id, body);
    return successResponse(product, "Product created successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create product", [], 400);
  }
}
