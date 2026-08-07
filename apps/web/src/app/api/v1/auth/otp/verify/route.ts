import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { otpVerifySchema } from "@/lib/validation";
import {
  findUserByEmail,
  verifyOtp,
  verifyAndCompleteSignup,
} from "@/services/otp.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = otpVerifySchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    if (parsed.data.purpose === "signup") {
      const result = await verifyAndCompleteSignup({
        email: parsed.data.email,
        code: parsed.data.code,
      });

      return successResponse(
        { purpose: "signup", verified: true, user: result.user },
        "Account created successfully"
      );
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user || !user.is_active) {
      return errorResponse("Invalid email address", [], 400);
    }

    const valid = await verifyOtp({
      userId: user.id,
      code: parsed.data.code,
      purpose: "login",
    });

    if (!valid) {
      return errorResponse("Invalid or expired verification code", [], 400);
    }

    return successResponse(
      { purpose: "login", verified: true },
      "Verification successful"
    );
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Verification failed", [], 400);
  }
}