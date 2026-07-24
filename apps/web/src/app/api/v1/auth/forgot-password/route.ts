import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { forgotPasswordSchema } from "@/lib/validation";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    await authService.forgotPassword(parsed.data.email);
    return successResponse(null, "Password reset email sent");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to send reset email", [], 400);
  }
}
