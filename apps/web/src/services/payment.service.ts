import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { initializeTransaction, verifyTransaction } from "@/services/paystack";
import { sendPaymentConfirmation, sendAdminNewOrderNotification } from "./email.service";
import { siteConfig } from "@/lib/seo";

interface CheckoutData {
  items: { product_id: string; quantity: number }[];
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_location_id: string;
  delivery_fee: number;
  subtotal: number;
  total_amount: number;
  notes?: string;
  user_id?: string | null;
}

const PAYMENT_EXPIRY_MS = parseInt(process.env.PAYMENT_EXPIRY_MINUTES || "30") * 60 * 1000;

function getAppUrl(): string {
  return process.env.APP_URL || siteConfig.url;
}

export async function generatePayment(checkoutData: CheckoutData) {
  const adminClient = createAdminClient();

  const txRef = `NF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MS).toISOString();

  let paymentUrl: string | null = null;
  let accessCode: string | null = null;
  let paystackError: Error | null = null;

  if (process.env.PAYSTACK_SECRET_KEY) {
    try {
      const tx = await initializeTransaction({
        email: checkoutData.customer_email,
        amount: checkoutData.total_amount,
        reference: txRef,
        callback_url: `${getAppUrl()}/payment/${txRef}`,
        metadata: {
          customer_name: checkoutData.customer_name,
          customer_phone: checkoutData.customer_phone,
        },
      });
      paymentUrl = tx.authorization_url || null;
      accessCode = tx.access_code || null;
    } catch (err) {
      console.error("[Paystack] Transaction initialization failed:", err);
      paystackError = err instanceof Error ? err : new Error("Paystack initialization failed");
    }
  }

  const { data: payment } = await adminClient
    .from("payments")
    .insert({
      flutterwave_reference: txRef,
      virtual_account_number: "",
      bank_name: null,
      account_name: null,
      amount: checkoutData.total_amount,
      payment_status: "pending",
      webhook_payload: {
        checkout_data: checkoutData,
        payment_url: paymentUrl,
        access_code: accessCode,
        expires_at: expiresAt,
      },
    })
    .select()
    .single();

  if (paymentUrl) {
    return {
      id: payment?.id || "",
      flutterwave_reference: txRef,
      amount: checkoutData.total_amount,
      payment_status: "pending",
      reference: txRef,
      payment_url: paymentUrl,
      expires_at: expiresAt,
    };
  }

  if (paystackError) throw new Error(paystackError.message);

  return {
    id: payment?.id || "",
    flutterwave_reference: txRef,
    amount: checkoutData.total_amount,
    payment_status: "pending",
    reference: txRef,
    payment_url: null,
    expires_at: expiresAt,
  };
}

export async function expirePayment(reference: string) {
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, payment_status")
    .eq("flutterwave_reference", reference)
    .single();

  if (!payment) throw new Error("Payment not found");
  if (payment.payment_status !== "pending") return { expired: false };

  await supabase
    .from("payments")
    .update({ payment_status: "expired" })
    .eq("id", payment.id);

  return { expired: true };
}

export async function createOrderFromPayment(flutterwaveReference: string) {
  const supabase = createAdminClient();

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("flutterwave_reference", flutterwaveReference)
    .single();

  if (paymentError || !payment) throw new Error("Payment not found");

  const { data: existingOrder } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (existingOrder) return existingOrder;

  const checkoutData = (payment.webhook_payload as { checkout_data: CheckoutData })?.checkout_data;
  if (!checkoutData) throw new Error("Checkout data not found in payment");

  const productIds = checkoutData.items.map((i) => i.product_id);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, selling_price, stock_quantity, is_active")
    .in("id", productIds);

  if (prodError) throw new Error("Failed to validate products");

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
  const stockNotes: string[] = [];

  for (const item of checkoutData.items) {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (!product.is_active) throw new Error(`${product.name} is no longer available`);
    if (product.stock_quantity < item.quantity) {
      stockNotes.push(`"${product.name}" — ordered ${item.quantity}, only ${product.stock_quantity} in stock`);
    }
  }

  const orderNumber = `NF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const notes = [checkoutData.notes, ...(stockNotes.length ? [`Stock issue: ${stockNotes.join("; ")}`] : [])]
    .filter(Boolean)
    .join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: checkoutData.user_id || null,
      customer_name: checkoutData.customer_name,
      customer_email: checkoutData.customer_email,
      customer_phone: checkoutData.customer_phone,
      delivery_location_id: checkoutData.delivery_location_id,
      subtotal: checkoutData.subtotal,
      delivery_fee: checkoutData.delivery_fee,
      total_amount: checkoutData.total_amount,
      payment_id: payment.id,
      payment_status: "paid",
      order_status: "payment_confirmed",
      notes: notes || null,
    })
    .select()
    .single();

  if (orderError) throw new Error("Failed to create order");

  const orderItems = checkoutData.items.map((item) => {
    const product = productMap.get(item.product_id)!;
    return {
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: product.selling_price,
      subtotal: product.selling_price * item.quantity,
    };
  });

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw new Error("Failed to create order items");

  for (const item of checkoutData.items) {
    const product = productMap.get(item.product_id)!;
    const deduction = Math.min(item.quantity, product.stock_quantity);
    await supabase
      .from("products")
      .update({ stock_quantity: product.stock_quantity - deduction })
      .eq("id", item.product_id);
  }

  sendPaymentConfirmation({
    email: checkoutData.customer_email,
    name: checkoutData.customer_name,
    orderNumber: order.order_number,
    items: checkoutData.items.map((item) => {
      const product = productMap.get(item.product_id)!;
      return { name: product.name, quantity: item.quantity, price: product.selling_price };
    }),
    total: checkoutData.total_amount,
  });

  sendAdminNewOrderNotification({
    orderNumber: order.order_number,
    customerName: checkoutData.customer_name,
    customerEmail: checkoutData.customer_email,
    customerPhone: checkoutData.customer_phone,
    total: checkoutData.total_amount,
    items: checkoutData.items.map((item) => {
      const product = productMap.get(item.product_id)!;
      return { name: product.name, quantity: item.quantity, price: product.selling_price };
    }),
  });

  return order;
}

async function markPaymentPaid(reference: string, actualAmount?: number) {
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("id, payment_status, amount, webhook_payload")
    .eq("flutterwave_reference", reference)
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
    const checkoutData = { ...(payload.checkout_data as CheckoutData | undefined) } as CheckoutData | undefined;
    const mismatchNote = `[AMOUNT MISMATCH] Expected: ${expectedAmount}, Received: ${actualAmount}. Order requires admin review.`;
    if (checkoutData) {
      checkoutData.notes = [checkoutData.notes || "", mismatchNote].filter(Boolean).join("\n");
    }
    const updatedPayload = {
      ...payload,
      amount_mismatch: true,
      expected_amount: expectedAmount,
      actual_amount: actualAmount,
      ...(checkoutData ? { checkout_data: checkoutData } : {}),
    };
    await supabase
      .from("payments")
      .update({
        payment_status: "paid",
        paid_at: new Date().toISOString(),
        webhook_payload: updatedPayload,
      })
      .eq("id", payment.id);
    if (checkoutData) {
      const order = await createOrderFromPayment(reference);
      return !!order;
    }
    return true;
  }

  await createOrderFromPayment(reference);
  await supabase
    .from("payments")
    .update({
      payment_status: "paid",
      paid_at: new Date().toISOString(),
    })
    .eq("id", payment.id);
  return true;
}

export async function confirmPaymentFromFlutterwave(txRef: string, actualAmount?: number) {
  return markPaymentPaid(txRef, actualAmount);
}

export async function confirmPaymentFromPaystack(reference: string) {
  let charge;
  try {
    charge = await verifyTransaction(reference);
  } catch {
    return false;
  }
  if (!charge || charge.status !== "success") return false;
  return markPaymentPaid(reference, charge.amount);
}

export async function getPaymentByReference(reference: string) {
  const supabase = createAdminClient();

  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("flutterwave_reference", reference)
    .single();

  if (!payment) throw new Error("Payment not found");

  if (payment.payment_status === "pending") {
    const expiresAt = (payment.webhook_payload as Record<string, unknown>)?.expires_at as string | undefined;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      await supabase
        .from("payments")
        .update({ payment_status: "expired" })
        .eq("id", payment.id);
      payment.payment_status = "expired";
    } else if (process.env.PAYSTACK_SECRET_KEY) {
      try {
        const verified = await confirmPaymentFromPaystack(reference);
        if (verified) payment.payment_status = "paid";
      } catch {
        // ignore verification errors
      }
    }
  }

  const wp = (payment.webhook_payload || {}) as Record<string, unknown>;
  const amountMismatch = payment.payment_status === "paid" && wp.amount_mismatch === true;

  let order = null;
  if (payment.payment_status === "paid" && !amountMismatch) {
    const { data: linkedOrder } = await supabase
      .from("orders")
      .select("id, order_number, order_status, payment_status")
      .eq("payment_id", payment.id)
      .single();

    order = linkedOrder;
  }

  return { payment_status: payment.payment_status, order, payment, amount_mismatch: amountMismatch };
}

export async function getPaymentStatus(orderId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: order } = await supabase
    .from("orders")
    .select("payment_status, payment:payments(*)")
    .eq("id", orderId)
    .single();

  if (!order) throw new Error("Order not found");

  const payment = order.payment as {
    flutterwave_reference?: string;
    payment_status?: string;
  } | null;

  if (payment?.flutterwave_reference && order.payment_status === "pending") {
    try {
      const verified = await confirmPaymentFromPaystack(payment.flutterwave_reference);
      if (verified) {
        await supabase
          .from("payments")
          .update({
            payment_status: "paid",
            paid_at: new Date().toISOString(),
          })
          .eq("flutterwave_reference", payment.flutterwave_reference);

        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            order_status: "payment_confirmed",
          })
          .eq("id", orderId);
      }
    } catch {
      // Ignore verification errors
    }
  }

  return {
    payment_status: order.payment_status,
    payment,
  };
}
