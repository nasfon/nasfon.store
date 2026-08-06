import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import * as sellerService from "@/services/seller.service";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const {
      shop_name,
      shop_slug,
      shop_address,
      shop_logo_url,
      contact_phone,
      contact_email,
      support_contact,
      business_description,
      verification_documents,
    } = body;

    if (!shop_name || !shop_slug || !shop_address || !contact_phone || !contact_email || !verification_documents) {
      return errorResponse("Missing required seller application fields", [], 400);
    }

    const seller = await sellerService.applyForSeller(user.id, {
      shop_name,
      shop_slug,
      shop_address,
      shop_logo_url,
      contact_phone,
      contact_email,
      support_contact,
      business_description,
      verification_documents,
    });

    return successResponse(seller, "Seller application submitted successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to submit application", [], 400);
  }
}
