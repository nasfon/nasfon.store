import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { z } from "zod";
import { verifyTransaction } from "@/services/paystack";
import { confirmPaymentFromPaystack, expirePayment } from "@/services/payment.service";

const referenceSchema = z.string().min(1).max(100);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const parsed = referenceSchema.safeParse(reference);
    if (!parsed.success) return errorResponse("Invalid reference");

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return errorResponse("Payment not configured", [], 503);
    }

    const charge = await verifyTransaction(reference);
    if (!charge) {
      return errorResponse("Payment not found", [], 404);
    }

    if (charge.status === "success") {
      await confirmPaymentFromPaystack(reference);
    }

    return successResponse({
      status: charge.status,
      amount: charge.amount,
      paid_at: charge.paid_at || null,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Verification failed", [], 500);
  }
}

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const parsed = referenceSchema.safeParse(reference);
    if (!parsed.success) return errorResponse("Invalid reference");
    const result = await expirePayment(reference);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to expire payment", [], 400);
  }
}
