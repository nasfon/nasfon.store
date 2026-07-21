import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> }
) {
  try {
    const { reference } = await params;
    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

    if (!flutterwaveSecretKey) {
      return errorResponse("Payment not configured", [], 503);
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/by_reference/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return errorResponse("Payment not found", [], 404);
    }

    return successResponse({
      status: data.data.status,
      amount: data.data.amount,
      currency: data.data.currency,
      paid_at: data.data.paid_at,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Verification failed", [], 500);
  }
}
