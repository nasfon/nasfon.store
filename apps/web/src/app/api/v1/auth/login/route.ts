import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const result = await authService.login(parsed.data);
    return successResponse(result, "Login successful");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Login failed", [], 401);
  }
}
