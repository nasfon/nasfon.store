import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import * as authService from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const result = await authService.register(parsed.data);
    return successResponse(result, "Account created successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Registration failed", [], 400);
  }
}
