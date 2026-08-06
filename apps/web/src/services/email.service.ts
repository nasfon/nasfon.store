import { Resend } from "resend";
import { createAdminClient } from "@/utils/supabase/admin";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.FROM_EMAIL || "NasFon Store <noreply@nasfon.store>";

function getResend() {
  if (!resendApiKey) return null;
  return new Resend(resendApiKey);
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
        <h1 style="margin:0;font-size:22px;color:#1a73e8">NasFon Store</h1>
      </td></tr>
      ${content}
      <tr><td style="padding:24px 32px 32px;text-align:center;border-top:1px solid #eee">
        <p style="margin:0;font-size:12px;color:#999">
          NasFon Store &mdash; Trusted Online Shopping<br>
          Need help? Reply to this email or contact our support team.
        </p>
      </td></tr>
    </table>
  </td></tr></table>
</body>
</html>`;
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