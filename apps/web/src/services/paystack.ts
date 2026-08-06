import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("Paystack credentials not configured");
  return key;
}

async function paystackFetch(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  const result = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof result.message === "string"
        ? result.message
        : result.status === "error" && typeof result.status === "string"
          ? result.status
          : `Paystack request failed with status ${response.status}`;
    throw new Error(message);
  }
  return result;
}

export async function initializeTransaction(params: {
  email: string;
  amount: number;
  reference: string;
  callback_url: string;
  metadata?: Record<string, unknown>;
}) {
  const result = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100),
      reference: params.reference,
      callback_url: params.callback_url,
      metadata: params.metadata,
      currency: "NGN",
    }),
  });

  const data = (result.data || {}) as Record<string, unknown>;
  return {
    authorization_url: String(data.authorization_url || ""),
    access_code: String(data.access_code || ""),
    reference: String(data.reference || params.reference),
  };
}

export async function verifyTransaction(reference: string): Promise<{
  status: string;
  amount: number;
  reference: string;
  paid_at: string | null;
}> {
  const result = await paystackFetch(`/transaction/verify/${encodeURIComponent(reference)}`);

  const data = (result.data || {}) as Record<string, unknown>;
  return {
    status: String(data.status || ""),
    amount: Number(data.amount || 0) / 100,
    reference: String(data.reference || reference),
    paid_at: typeof data.paid_at === "string" ? data.paid_at : null,
  };
}

export function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  if (!signature) return false;
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) return false;

  const expected = crypto.createHmac("sha512", secretKey).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}
