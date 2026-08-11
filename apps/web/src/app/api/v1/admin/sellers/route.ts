import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import * as adminSellersService from "@/services/admin/sellers.service";

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const sellers = await adminSellersService.adminGetSellers({ status, search });
    return successResponse(sellers);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch sellers", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const {
      full_name,
      email,
      password,
      phone_number,
      shop_name,
      shop_slug,
      shop_address,
      shop_logo_url,
      contact_phone,
      contact_email,
      support_contact,
      business_description,
    } = body;

    const required = [
      ["full_name", full_name],
      ["email", email],
      ["password", password],
      ["shop_name", shop_name],
      ["shop_slug", shop_slug],
      ["shop_address", shop_address],
      ["contact_phone", contact_phone],
      ["contact_email", contact_email],
    ] as const;

    const missing = required
      .filter(([, value]) => typeof value !== "string" || value.trim() === "")
      .map(([field]) => field);

    if (missing.length > 0) {
      return errorResponse(
        `Missing required fields: ${missing.join(", ")}`,
        missing,
        400
      );
    }

    const seller = await adminSellersService.adminCreateSeller({
      full_name,
      email,
      password,
      phone_number,
      shop_name,
      shop_slug,
      shop_address,
      shop_logo_url,
      contact_phone,
      contact_email,
      support_contact,
      business_description,
    });

    return successResponse(seller, "Seller created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create seller", [], 400);
  }
}
