import { NextRequest } from "next/server";
import { successResponse, errorResponse, getAuthUser, withRateLimit } from "@/lib/api";
import { checkoutSchema } from "@/lib/validation";
import * as checkoutService from "@/services/checkout.service";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "checkout");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const user = await getAuthUser();

    const result = await checkoutService.createCheckout({
      ...parsed.data,
      user_id: user?.id || null,
    });

    return successResponse(result, "Payment initiated", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Checkout failed", [], 400);
  }
}
