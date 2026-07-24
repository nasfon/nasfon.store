import { NextRequest } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { rateLimitMiddleware, getRateLimitHeaders } from "@/lib/rate-limit";
import { createOrderFromPayment } from "@/services/payment.service";

async function processPayment(txRef: string, actualAmount?: number) {
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, payment_status, amount, webhook_payload")
    .eq("flutterwave_reference", txRef)
    .single();

  if (!payment) return false;

  if (payment.payment_status === "paid") return true;

  if (payment.payment_status === "expired") return false;

  const expiresAt = (payment.webhook_payload as Record<string, unknown>)?.expires_at as string | undefined;
  if (expiresAt && new Date(expiresAt) < new Date()) {
    await supabase
      .from("payments")
      .update({ payment_status: "expired" })
      .eq("id", payment.id);
    return false;
  }

  const expectedAmount = payment.amount;
  if (actualAmount !== undefined && actualAmount !== expectedAmount) {
    const payload = payment.webhook_payload as Record<string, unknown>;
    await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        webhook_payload: {
          ...payload,
          amount_mismatch: true,
          expected_amount: expectedAmount,
          actual_amount: actualAmount,
        },
      })
      .eq("id", payment.id);
    return true;
  }

  await createOrderFromPayment(txRef);
  await supabase
    .from("payments")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.id);
  return true;
}

function getEventType(body: Record<string, unknown>): string | null {
  if (typeof body.event === "string") return body.event;
  if (typeof body.type === "string") return body.type;
  return null;
}

function getTxRef(data: Record<string, unknown>): string | null {
  if (typeof data.tx_ref === "string") return data.tx_ref;
  if (typeof data.reference === "string") return data.reference;
  return null;
}

function getAmount(data: Record<string, unknown>): number | undefined {
  if (typeof data.amount === "number") return data.amount;
  if (typeof data.amount === "string") return parseFloat(data.amount);
  if (typeof data.charged_amount === "number") return data.charged_amount;
  if (typeof data.charged_amount === "string") return parseFloat(data.charged_amount);
  return undefined;
}

function isSuccessful(data: Record<string, unknown>): boolean {
  if (data.status === "successful") return true;
  if (data.status === "succeeded") return true;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rateResult = rateLimitMiddleware(ip, "webhook");
    if (!rateResult.allowed) {
      return new Response("Too many requests", {
        status: 429,
        headers: getRateLimitHeaders(rateResult),
      });
    }

    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!secretHash) {
      return new Response("Webhook not configured", { status: 503 });
    }

    const signature = request.headers.get("verif-hash");
    if (!signature || signature !== secretHash) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = await request.json();
    const eventType = getEventType(body);
    const data = (body.data || {}) as Record<string, unknown>;

    if (
      (eventType === "charge.completed" || eventType === "virtual_account.credited") &&
      isSuccessful(data)
    ) {
      const txRef = getTxRef(data);
      const actualAmount = getAmount(data);
      if (txRef) {
        await processPayment(txRef, actualAmount);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
