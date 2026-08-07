import { Resend } from "resend";
import { setDefaultResultOrder } from "node:dns";
import { createAdminClient } from "@/utils/supabase/admin";

// Prefer IPv4 when resolving api.resend.com. Some runtimes resolve IPv6 first
// even when there is no IPv6 route, which makes `fetch` fail with
// "Unable to fetch data. The request could not be resolved." even though IPv4
// reachability is fine.
try {
  setDefaultResultOrder("ipv4first");
} catch {
  // Not supported on this Node version — ignore.
}

const fromEmail = process.env.FROM_EMAIL || "Market <noreply@market.nasfon.com>";

// Recommended to leave unset (defaults to the Resend API). If a custom value
// is provided it must point at the Resend API, not an application URL.
const resendBaseUrl = process.env.RESEND_BASE_URL || "https://api.resend.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key, { baseUrl: resendBaseUrl });
}

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const cause = err.cause as { code?: string; message?: string } | undefined;
    if (cause?.code || cause?.message) {
      return `network error (${cause.code || cause.message})`;
    }
    return err.message;
  }
  return JSON.stringify(err);
}

/**
 * Produces an actionable message for the most common Resend failures:
 * an unverified sender domain or a per-request validation error.
 */
function deliveryErrorMessage(err: unknown): string {
  const e = err as { statusCode?: number; name?: string; message?: string } | null;

  if (e && typeof e === "object") {
    const verifiedDomainMatch = e.message?.match(/The (.+?) domain is not verified/);
    if (verifiedDomainMatch) {
      const domain = verifiedDomainMatch[1];
      return `your sender domain "${domain}" is not verified in Resend. Add it at https://resend.com/domains and verify the DNS records, then set FROM_EMAIL to an address on the verified domain.`;
    }

    if (typeof e.message === "string") {
      return `${e.name || "Resend error"}${e.statusCode ? ` (${e.statusCode})` : ""}: ${e.message}`;
    }
  }

  return describeError(err);
}

/**
 * Sends an email through Resend with optional retries.
 *
 * With `throwOnError`, delivery failures are surfaced to the caller so flows
 * that depend on the email (e.g. OTP verification) can fail loudly instead of
 * silently reporting success. Only the outer SDK error — a network-level
 * failure reaching api.resend.com (SDK `application_error`, `statusCode:
 * null`) — is retried, since per Resend's error docs it's transient and
 * resolving the request again is the recommended action.
 */
async function sendEmailWithRetry(params: {
  from: string;
  to: string;
  subject: string;
  html: string;
  throwOnError?: boolean;
}): Promise<void> {
  const resend = getResend();
  if (!resend) {
    if (params.throwOnError) {
      throw new Error(
        "Email delivery is not configured. Set RESEND_API_KEY and FROM_EMAIL."
      );
    }
    return;
  }

  const attempts = params.throwOnError ? 3 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, 750 * attempt));
    }
    try {
      const { error } = await resend.emails.send({
        from: params.from,
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      if (!error) return;
      lastError = error;
    } catch (err) {
      lastError = err;
    }
  }

  console.error("Failed to send email:", lastError);

  if (params.throwOnError) {
    throw new Error(
      `Email delivery failed because ${deliveryErrorMessage(
        lastError
      )} (via ${resendBaseUrl}). Please try again after fixing the sender domain.`
    );
  }
}

async function getAdminEmail(): Promise<string> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("settings")
      .select("admin_email")
      .single();
    return data?.admin_email || "";
  } catch {
    return "";
  }
}

function orderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pending",
    payment_confirmed: "Payment Confirmed",
    processing: "Processing",
    ready_for_delivery: "Ready for Delivery",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

function layout(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px">
    <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
      <tr><td style="padding:32px 32px 0;text-align:center">
        <h1 style="margin:0;font-size:22px;color:#1a73e8">Market</h1>
      </td></tr>
      ${content}
      <tr><td style="padding:24px 32px 32px;text-align:center;border-top:1px solid #eee">
        <p style="margin:0;font-size:12px;color:#999">
          Market &mdash; Trusted Online Shopping by NasFon<br>
          Need help? Reply to this email or contact our support team.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
}

export async function sendOtpEmail(params: { email: string; code: string; purpose?: string }) {
  const isSignup = params.purpose === "signup";

  await sendEmailWithRetry({
    from: fromEmail,
    to: params.email,
    subject: isSignup ? "Verify your email address" : "Confirm your login",
    html: layout(`
      <tr><td style="padding:24px 32px;text-align:center">
        <p style="margin:0 0 4px;font-size:14px;color:#666">${
          isSignup
            ? "Confirm your email to finish creating your account. Use the code below to verify it"
            : "Use the code below to confirm your login"
        }.</p>
        <div style="margin:20px 0;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px">
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px;color:#0369a1">${params.code}</p>
        </div>
        <p style="margin:0;font-size:12px;color:#999">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
      </td></tr>
    `),
    throwOnError: true,
  });
}

export async function sendPasswordResetEmail(params: { email: string; code: string }) {
  await sendEmailWithRetry({
    from: fromEmail,
    to: params.email,
    subject: "Reset your password",
    html: layout(`
      <tr><td style="padding:24px 32px;text-align:center">
        <p style="margin:0 0 4px;font-size:14px;color:#666">Use the code below to reset your password. Enter it together with your new password on our site.</p>
        <div style="margin:20px 0;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px">
          <p style="margin:0;font-size:32px;font-weight:700;letter-spacing:6px;color:#0369a1">${params.code}</p>
        </div>
        <p style="margin:0;font-size:12px;color:#999">This code expires in 10 minutes. If you didn't request it, you can ignore this email.</p>
      </td></tr>
    `),
    throwOnError: true,
  });
}

export async function sendPaymentConfirmation(params: {
  email: string;
  name: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const resend = getResend();
  if (!resend) return;

  const itemsHtml = params.items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333">${item.name} x${item.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#333;text-align:right">₦${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`,
    )
    .join("");

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: params.email,
    subject: `Payment Received — ${params.orderNumber}`,
    html: layout(`
      <tr><td style="padding:24px 32px">
        <div style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;padding:12px;text-align:center;margin-bottom:16px">
          <p style="margin:0;font-size:14px;font-weight:600;color:#166534">Payment Confirmed ✓</p>
        </div>
        <p style="margin:0 0 4px;font-size:14px;color:#666">Hi ${params.name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#666">Your payment for order <strong style="color:#333">${params.orderNumber}</strong> has been received. We're now processing your order.</p>

        <table width="100%">
          ${itemsHtml}
        </table>

        <div style="margin-top:12px;text-align:right;font-size:16px;font-weight:700;color:#333">
          Total Paid: ₦${params.total.toLocaleString()}
        </div>

        <p style="margin:16px 0 0;font-size:13px;color:#666">You can track your order status anytime on our website.</p>
      </td></tr>
    `),
  });

  if (error) console.error("Failed to send payment confirmation email:", error);
}

export async function sendOrderStatusUpdate(params: {
  email: string;
  name: string;
  orderNumber: string;
  newStatus: string;
  notes?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: params.email,
    subject: `Order Update — ${params.orderNumber} is now ${orderStatusLabel(params.newStatus)}`,
    html: layout(`
      <tr><td style="padding:24px 32px">
        <p style="margin:0 0 4px;font-size:14px;color:#666">Hi ${params.name},</p>
        <p style="margin:0 0 16px;font-size:14px;color:#666">
          Your order <strong style="color:#333">${params.orderNumber}</strong> status has been updated to:
        </p>
        <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;text-align:center;margin-bottom:16px">
          <p style="margin:0;font-size:16px;font-weight:600;color:#0369a1">${orderStatusLabel(params.newStatus)}</p>
        </div>
        ${params.notes ? `<p style="margin:0 0 16px;font-size:13px;color:#666">Notes: ${params.notes}</p>` : ""}
        <p style="margin:0;font-size:13px;color:#666">Track your order for the latest updates.</p>
      </td></tr>
    `),
  });

  if (error) console.error("Failed to send status update email:", error);
}

export async function sendAdminNewOrderNotification(params: {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
}) {
  const adminEmail = await getAdminEmail();
  if (!adminEmail) return;

  const resend = getResend();
  if (!resend) return;

  const itemsHtml = params.items
    .map(
      (item) => `
    <tr>
      <td style="padding:6px 0;border-bottom:1px solid #eee;font-size:13px;color:#333">${item.name} x${item.quantity}</td>
      <td style="padding:6px 0;border-bottom:1px solid #eee;font-size:13px;color:#333;text-align:right">₦${(item.price * item.quantity).toLocaleString()}</td>
    </tr>`,
    )
    .join("");

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New Order — ${params.orderNumber}`,
    html: layout(`
      <tr><td style="padding:24px 32px">
        <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;text-align:center;margin-bottom:16px">
          <p style="margin:0;font-size:14px;font-weight:600;color:#92400e">New Order Received</p>
        </div>
        <table width="100%" style="margin-bottom:16px">
          <tr><td style="font-size:13px;color:#666;padding:4px 0">Order:</td><td style="font-size:13px;color:#333;font-weight:600;padding:4px 0;text-align:right">${params.orderNumber}</td></tr>
          <tr><td style="font-size:13px;color:#666;padding:4px 0">Customer:</td><td style="font-size:13px;color:#333;padding:4px 0;text-align:right">${params.customerName}</td></tr>
          <tr><td style="font-size:13px;color:#666;padding:4px 0">Email:</td><td style="font-size:13px;color:#333;padding:4px 0;text-align:right">${params.customerEmail}</td></tr>
          <tr><td style="font-size:13px;color:#666;padding:4px 0">Phone:</td><td style="font-size:13px;color:#333;padding:4px 0;text-align:right">${params.customerPhone}</td></tr>
        </table>
        <table width="100%">
          <tr><td style="padding:6px 0;font-size:13px;font-weight:600;color:#333;border-bottom:2px solid #ddd">Item</td><td style="padding:6px 0;font-size:13px;font-weight:600;color:#333;border-bottom:2px solid #ddd;text-align:right">Subtotal</td></tr>
          ${itemsHtml}
        </table>
        <div style="margin-top:12px;text-align:right;font-size:16px;font-weight:700;color:#333">
          Total: ₦${params.total.toLocaleString()}
        </div>
      </td></tr>
    `),
  });

  if (error) console.error("Failed to send admin notification:", error);
}