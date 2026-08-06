import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import * as sellerService from "@/services/seller.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const seller = await sellerService.getSellerBySlug(slug);
    return successResponse(seller);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Seller not found", [], 404);
  }
}
