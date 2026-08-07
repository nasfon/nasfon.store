import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { sanitizeName } from "@/lib/sanitize";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const sanitized = {
      ...parsed.data,
      full_name: sanitizeName(parsed.data.full_name),
    };

    const data = {
      full_name: sanitized.full_name,
      email: sanitized.email,
      password: sanitized.password,
      phone_number: sanitized.phone_number,
    };

    const result = await authService.register(data);
    return successResponse(result, "Verification code sent", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Registration failed", [], 400);
  }
}
