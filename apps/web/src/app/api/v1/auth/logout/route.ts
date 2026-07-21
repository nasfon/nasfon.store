import { successResponse, errorResponse } from "@/lib/api";
import * as authService from "@/services/auth.service";

export async function POST() {
  try {
    await authService.logout();
    return successResponse(null, "Logged out successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Logout failed", [], 400);
  }
}
