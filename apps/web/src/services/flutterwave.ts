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
    : "https://f4bexperience.flutterwave.com";
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

export async function createCustomer(params: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<string> {
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
      email: params.email,
      name: { first: params.firstName, last: params.lastName },
      phonenumber: params.phone || "",
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("[Flutterwave v4] createCustomer error:", JSON.stringify(result));
    throw new Error(result.message || "Failed to create customer");
  }

  console.log("[Flutterwave v4] createCustomer response:", JSON.stringify(result.data, null, 2));
  const d = result.data || result;
  return String(d.id || d.customer_id || "");
}

export async function findCustomerByEmail(email: string): Promise<string | null> {
  const token = await getAccessToken();
  const config = getConfig()!;
  const baseUrl = getBaseUrl(config.environment);

  const response = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(email)}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Trace-Id": crypto.randomUUID(),
    },
  });

  const result = await response.json();
  if (!response.ok) {
    console.warn("[Flutterwave v4] findCustomerByEmail error:", JSON.stringify(result));
    return null;
  }

  const data = result.data || result;
  const customers = Array.isArray(data) ? data : data.customers || [data];
  if (customers.length > 0) {
    return String(customers[0].id || customers[0].customer_id || "");
  }
  return null;
}

export async function findOrCreateCustomer(params: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<string> {
  const existing = await findCustomerByEmail(params.email);
  if (existing) return existing;
  return createCustomer(params);
}

export async function createVirtualAccount(params: {
  customer_id: string;
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
      account_type: "dynamic",
      reference: params.reference,
      customer_id: params.customer_id,
      amount: params.amount,
      currency: params.currency || "NGN",
      expiry: params.expiry || 60,
      narration: params.narration || undefined,
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    console.error("[Flutterwave v4] createVirtualAccount error:", JSON.stringify(result));
    throw new Error(result.message || "Failed to create virtual account");
  }

  console.log("[Flutterwave v4] createVirtualAccount response:", JSON.stringify(result.data, null, 2));

  const d = (result.data || result) as Record<string, unknown>;
  const customerObj = typeof d.customer === "object" && d.customer ? (d.customer as Record<string, unknown>) : {};
  const customerName = String(customerObj.name || customerObj.first_name || customerObj.last_name || "");
  return {
    id: String(d.id || d.flw_ref || ""),
    account_number: String(d.account_number || ""),
    account_bank_name: String(d.bank_name || d.account_bank_name || ""),
    account_name: String(d.account_name || d.beneficiary || d.beneficiary_name || customerName || params.narration || ""),
    account_expiration_datetime: String(d.expiry_date || d.account_expiration_datetime || ""),
    reference: String(d.reference || params.reference),
    customer_id: String(d.customer_id || params.customer_id),
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

  const data = (result.data || result) as Record<string, unknown>;
  const charges = Array.isArray(data) ? data : [data];
  charges[0] = charges[0] || {};
  return {
    id: String(charges[0].id || ""),
    status: String(charges[0].status || ""),
    amount: Number(charges[0].amount) || 0,
    paid_at: String(charges[0].paid_at || ""),
  };
}
