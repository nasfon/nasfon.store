import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { resetCodeSchema } from "@/lib/validation";
import { verifyResetCode } from "@/services/passwordReset.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "auth");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = resetCodeSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    await verifyResetCode(parsed.data);
    return successResponse(null, "Code verified");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Verification failed", [], 400);
  }
}