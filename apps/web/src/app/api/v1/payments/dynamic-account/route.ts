import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { findOrCreateCustomer, createVirtualAccount } from "@/services/flutterwave";

export async function POST(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request, "payment");
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const hasV4Credentials =
      process.env.FLUTTERWAVE_CLIENT_ID && process.env.FLUTTERWAVE_CLIENT_SECRET;

    if (!hasV4Credentials) {
      return errorResponse("Payment not configured", [], 503);
    }

    const body = await request.json();
    const { amount, email, fullname, phonenumber } = body;

    if (!amount || !email) {
      return errorResponse("Amount and email are required");
    }

    const txRef = `NF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const nameParts = (fullname || "").split(" ");
    const firstname = nameParts[0] || email;
    const lastname = nameParts.slice(1).join(" ") || firstname;

    const customer = await findOrCreateCustomer({
      email,
      firstName: firstname,
      lastName: lastname,
      phone: phonenumber,
    });

    const va = await createVirtualAccount({
      customerId: customer.id,
      amount,
      reference: txRef,
      narration: fullname || email,
    });

    return successResponse({
      bank_name: va.account_bank_name,
      account_number: va.account_number,
      account_name: va.account_name,
      amount,
      reference: txRef,
      expires_at: va.account_expiration_datetime,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment initiation failed", [], 500);
  }
}
