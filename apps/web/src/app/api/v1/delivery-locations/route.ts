import { successResponse, errorResponse } from "@/lib/api";
import { getActiveDeliveryLocations } from "@/services/delivery-location.service";

export async function GET() {
  try {
    const locations = await getActiveDeliveryLocations();
    return successResponse(locations);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch locations", [], 500);
  }
}
