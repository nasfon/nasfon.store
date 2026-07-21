import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminSettingsSchema } from "@/lib/validation";
import * as settingsService from "@/services/admin/settings.service";

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const settings = await settingsService.getAdminSettings();
    return successResponse(settings);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to fetch settings", [], 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const body = await request.json();
    const parsed = adminSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const settings = await settingsService.updateSettings(parsed.data);
    return successResponse(settings, "Settings updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update settings", [], 400);
  }
}
