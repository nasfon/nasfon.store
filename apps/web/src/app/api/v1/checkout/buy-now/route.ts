import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { buyNowSchema } from "@/lib/validation";
import * as checkoutService from "@/services/checkout.service";
import { getAuthUser } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = buyNowSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const user = await getAuthUser();

    const result = await checkoutService.buyNow({
      ...parsed.data,
      user_id: user?.id || null,
    });

    return successResponse(result, "Order placed successfully", 201);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Checkout failed", [], 400);
  }
}
