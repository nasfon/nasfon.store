import { successResponse, errorResponse } from "@/lib/api";
import * as authService from "@/services/auth.service";

export async function GET() {
  try {
    const user = await authService.getMe();
    return successResponse(user);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Not authenticated", [], 401);
  }
}
