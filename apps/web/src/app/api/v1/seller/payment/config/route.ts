import { NextRequest } from "next/server";
import { successResponse, errorResponse, requireUser } from "@/lib/api";
import * as sellerService from "@/services/seller.service";

export async function POST(request: NextRequest) {
  try {
    const { user, error } = await requireUser(request);
    if (error) return error;

    const body = await request.json();
    const { paystack_public_key, paystack_secret_key } = body;

    if (!paystack_public_key || !paystack_secret_key) {
      return errorResponse("Paystack public and secret keys are required", [], 400);
    }

    const seller = await sellerService.updatePaystackConfig(user.id, {
      paystack_public_key,
      paystack_secret_key,
    });

    return successResponse(seller, "Paystack payment configuration updated successfully");
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to update payment configuration", [], 400);
  }
}
