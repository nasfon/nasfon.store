interface FlutterwaveConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

function getConfig(): FlutterwaveConfig | null {
  const clientId = process.env.FLUTTERWAVE_CLIENT_ID;
  const clientSecret = process.env.FLUTTERWAVE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;
  const environment = process.env.FLUTTERWAVE_ENVIRONMENT === "live" ? "live" : "sandbox";
  return { clientId, clientSecret, environment };
}

function getBaseUrl(env: "sandbox" | "live"): string {
  return env === "sandbox"
    ? "https://developersandbox-api.flutterwave.com"
    : "https://api.flutterwave.com";
}

export async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.accessToken;
  }

  const config = getConfig();
  if (!config) throw new Error("Flutterwave v4 credentials not configured");

  const params = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(
    "https://idp.flutterwave.com/realms/flutterwave/protocol/openid-connect/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    }
  );

  const data = await response.json();
  if (!response.ok) throw new Error(data.error_description || "Failed to get access token");

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return data.access_token;
}

export async function createCustomer(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const token = await getAccessToken();
  const config = getConfig()!;
  const baseUrl = getBaseUrl(config.environment);

  const response = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      email: data.email,
      name: { first: data.firstName, last: data.lastName },
      phonenumber: data.phone || undefined,
    }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Failed to create customer");
  return result.data as { id: string; email: string; name: { first: string; last: string } };
}

export async function findCustomerByEmail(email: string) {
  const token = await getAccessToken();
  const config = getConfig()!;
  const baseUrl = getBaseUrl(config.environment);

  const response = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(email)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
    },
  });

  const result = await response.json();
  if (!response.ok) return null;
  const customers = result.data as { id: string; email: string }[];
  return customers?.length > 0 ? customers[0] : null;
}

export async function findOrCreateCustomer(data: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const existing = await findCustomerByEmail(data.email);
  if (existing) return existing;
  return createCustomer(data);
}

export async function createVirtualAccount(params: {
  customerId: string;
  amount: number;
  reference: string;
  currency?: string;
  expiry?: number;
  narration?: string;
}) {
  const token = await getAccessToken();
  const config = getConfig()!;
  const baseUrl = getBaseUrl(config.environment);

  const response = await fetch(`${baseUrl}/virtual-accounts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
      "X-Idempotency-Key": params.reference,
    },
    body: JSON.stringify({
      reference: params.reference,
      customer_id: params.customerId,
      amount: params.amount,
      currency: params.currency || "NGN",
      account_type: "dynamic",
      expiry: params.expiry || 3600,
      narration: params.narration || undefined,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Failed to create virtual account");
  }

  console.log("[Flutterwave v4] createVirtualAccount response:", JSON.stringify(result.data, null, 2));

  const d = result.data as Record<string, unknown>;
  return {
    id: String(d.id || ""),
    account_number: String(d.account_number || ""),
    account_bank_name: String(d.account_bank_name || d.bank_name || ""),
    account_name: String(d.account_name || d.beneficiary_name || d.customer_name || ""),
    account_expiration_datetime: String(d.account_expiration_datetime || d.expiry_date || ""),
    reference: String(d.reference || ""),
    customer_id: String(d.customer_id || ""),
    amount: Number(d.amount) || 0,
    status: String(d.status || ""),
    note: String(d.note || ""),
  };
}

export async function getCharge(reference: string) {
  const token = await getAccessToken();
  const config = getConfig()!;
  const baseUrl = getBaseUrl(config.environment);

  const response = await fetch(`${baseUrl}/charges?reference=${encodeURIComponent(reference)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
    },
  });

  const result = await response.json();
  if (!response.ok) return null;
  const charges = result.data as { id: string; status: string; amount: number; paid_at?: string }[];
  return charges?.length > 0 ? charges[0] : null;
}
