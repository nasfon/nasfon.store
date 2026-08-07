import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { resetPasswordSchema } from "@/lib/validation";
import { resetPasswordWithCode } from "@/services/passwordReset.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    await resetPasswordWithCode({
      email: parsed.data.email,
      code: parsed.data.code,
      newPassword: parsed.data.password,
    });
    return successResponse(null, "Password reset successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to reset password", [], 400);
  }
}