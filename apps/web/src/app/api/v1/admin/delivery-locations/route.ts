import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminDeliveryLocationSchema } from "@/lib/validation";
import * as locationsService from "@/services/admin/delivery-locations.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const locations = await locationsService.getAdminDeliveryLocations();
    return successResponse(locations);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch locations", [], 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = adminDeliveryLocationSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const location = await locationsService.createDeliveryLocation(parsed.data);
    return successResponse(location, "Location created", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to create location", [], 400);
  }
}
