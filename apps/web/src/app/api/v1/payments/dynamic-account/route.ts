import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!flutterwaveSecretKey) {
      return errorResponse("Payment not configured", [], 503);
    }

    const body = await request.json();
    const { amount, email, fullname, order_id } = body;

    if (!amount || !email) {
      return errorResponse("Amount and email are required");
    }

    const txRef = `NF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const response = await fetch(
      "https://api.flutterwave.com/v3/virtual-account-numbers",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flutterwaveSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          tx_ref: txRef,
          fullname: fullname || email,
          is_permanent: false,
          meta: order_id ? { order_id } : undefined,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.status !== "success") {
      return errorResponse(data.message || "Failed to generate account", [], 400);
    }

    return successResponse({
      bank_name: data.data.bank_name,
      account_number: data.data.account_number,
      account_name: data.data.account_name,
      amount,
      reference: txRef,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment initiation failed", [], 500);
  }
}
