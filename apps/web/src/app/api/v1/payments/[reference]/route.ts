import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";
import { getCharge } from "@/services/flutterwave";
import { confirmPaymentFromFlutterwave, expirePayment } from "@/services/payment.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;

    if (!process.env.FLUTTERWAVE_CLIENT_ID || !process.env.FLUTTERWAVE_CLIENT_SECRET) {
      return errorResponse("Payment not configured", [], 503);
    }

    const charge = await getCharge(reference);
    if (!charge) {
      return errorResponse("Payment not found", [], 404);
    }

    if (charge.status === "successful") {
      await confirmPaymentFromFlutterwave(reference, charge.amount);
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
    const result = await expirePayment(reference);
    return successResponse(result);
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Failed to expire payment", [], 400);
  }
}
