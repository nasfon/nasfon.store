import { NextRequest } from "next/server";
import { rateLimitMiddleware, getRateLimitHeaders } from "@/lib/rate-limit";
import { verifyWebhookSignature } from "@/services/paystack";
import { confirmPaymentFromPaystack } from "@/services/payment.service";

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

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return new Response("Webhook not configured", { status: 503 });
    }

    const signature = request.headers.get("x-paystack-signature");
    const rawBody = await request.text();

    if (!verifyWebhookSignature(rawBody, signature)) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
      event?: string;
      data?: Record<string, unknown>;
    };

    const data = body.data || {};

    if (body.event === "charge.success" && data.status === "success") {
      const reference = typeof data.reference === "string" ? data.reference : null;
      if (reference) {
        await confirmPaymentFromPaystack(reference);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Paystack webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
