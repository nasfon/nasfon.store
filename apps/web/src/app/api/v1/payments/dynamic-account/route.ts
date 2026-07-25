import { NextRequest } from "next/server";
import { successResponse, errorResponse, withRateLimit } from "@/lib/api";
import { dynamicAccountSchema } from "@/lib/validation";
import { createVirtualAccount, findOrCreateCustomer } from "@/services/flutterwave";

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
    const parsed = dynamicAccountSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Validation failed", parsed.error.flatten().fieldErrors as unknown as string[]);
    }

    const { amount, email, fullname, phonenumber } = parsed.data;

    const nameParts = (fullname || email).split(" ");
    const firstname = nameParts[0] || email;
    const lastname = nameParts.slice(1).join(" ") || firstname;

    const customerId = await findOrCreateCustomer({
      email,
      firstName: firstname,
      lastName: lastname,
      phone: phonenumber,
    });

    const txRef = `NF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const va = await createVirtualAccount({
      customer_id: customerId,
      amount,
      reference: txRef,
      narration: fullname || email,
    });

    return successResponse({
      bank_name: va.account_bank_name,
      account_number: va.account_number,
      account_name: fullname || email,
      amount,
      reference: txRef,
      expires_at: va.account_expiration_datetime,
    });
  } catch (err) {
    return errorResponse(err instanceof Error ? err.message : "Payment initiation failed", [], 500);
  }
}
