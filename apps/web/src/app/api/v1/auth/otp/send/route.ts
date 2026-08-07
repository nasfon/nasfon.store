import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { otpSendSchema } from "@/lib/validation";
import { createAndSendOtp, findUserByEmail, resendPendingOtp } from "@/services/otp.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = otpSendSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    if (parsed.data.purpose === "signup") {
      const existingUser = await findUserByEmail(parsed.data.email);
      if (existingUser) {
        if (existingUser.email_verified_at) {
          return errorResponse("Email is already verified", [], 400);
        }
        return errorResponse("An account with this email already exists", [], 400);
      }

      const sent = await resendPendingOtp(parsed.data.email);
      if (!sent) {
        return errorResponse("No pending registration found for this email. Please register first.", [], 400);
      }

      return successResponse({ purpose: "signup" }, "Verification code sent");
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user || !user.is_active) {
      return errorResponse("Invalid email address", [], 400);
    }

    const { expiresAt } = await createAndSendOtp({
      userId: user.id,
      email: user.email,
      purpose: "login",
    });

    return successResponse({ purpose: "login", expiresAt }, "Verification code sent");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to send code", [], 400);
  }
}