import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireAdmin } from "@/lib/api";
import { adminSettingsSchema } from "@/lib/validation";
import { sanitizePlainText, sanitizePhone } from "@/lib/sanitize";
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
    const { error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const parsed = adminSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const sanitized = {
      ...parsed.data,
      ...(parsed.data.support_phone !== undefined ? { support_phone: sanitizePhone(parsed.data.support_phone || "") } : {}),
      ...(parsed.data.store_address !== undefined ? { store_address: sanitizePlainText(parsed.data.store_address || "", 500) } : {}),
      ...(parsed.data.return_policy !== undefined ? { return_policy: sanitizePlainText(parsed.data.return_policy || "", 5000) } : {}),
      ...(parsed.data.privacy_policy !== undefined ? { privacy_policy: sanitizePlainText(parsed.data.privacy_policy || "", 5000) } : {}),
      ...(parsed.data.terms_conditions !== undefined ? { terms_conditions: sanitizePlainText(parsed.data.terms_conditions || "", 5000) } : {}),
    };

    const settings = await settingsService.updateSettings(sanitized);
    return successResponse(settings, "Settings updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update settings", [], 400);
  }
}
