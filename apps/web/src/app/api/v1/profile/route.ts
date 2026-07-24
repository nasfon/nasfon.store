import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import { profileSchema } from "@/lib/validation";
import * as profileService from "@/services/profile.service";
import { sanitizeName, sanitizePhone } from "@/lib/sanitize";

export async function GET() {
  try {
    const { user, error } = await requireUser();
    if (error) return error;

    const profile = await profileService.getProfile(user.id);
    return successResponse(profile);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Profile not found", [], 404);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    if (body.full_name) body.full_name = sanitizeName(body.full_name);
    if (body.phone_number) body.phone_number = sanitizePhone(body.phone_number);

    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const profile = await profileService.updateProfile(user.id, parsed.data);
    return successResponse(profile, "Profile updated");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update profile", [], 400);
  }
}
