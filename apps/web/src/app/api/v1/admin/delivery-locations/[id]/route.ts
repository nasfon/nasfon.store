import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminDeliveryLocationUpdateSchema } from "@/lib/validation";
import * as locationsService from "@/services/admin/delivery-locations.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const parsed = adminDeliveryLocationUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const location = await locationsService.updateDeliveryLocation(id, parsed.data);
    return successResponse(location, "Location updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update location", [], 400);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const { id } = await params;
    await locationsService.deleteDeliveryLocation(id);
    return successResponse(null, "Location deleted");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to delete location", [], 400);
  }
}
