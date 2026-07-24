import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  findOrCreateCustomer,
  createVirtualAccount,
  getCharge,
} from "@/services/flutterwave";

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

const PAYMENT_EXPIRY_MS = parseInt(process.env.PAYMENT_EXPIRY_MINUTES || "1") * 60 * 1000;

export async function generatePayment(checkoutData: CheckoutData) {
  const adminClient = createAdminClient();

  const txRef = `NF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const expiresAt = new Date(Date.now() + PAYMENT_EXPIRY_MS).toISOString();

  const hasV4Credentials =
    process.env.FLUTTERWAVE_CLIENT_ID && process.env.FLUTTERWAVE_CLIENT_SECRET;

  if (hasV4Credentials) {
    try {
      const nameParts = (checkoutData.customer_name || checkoutData.customer_email).split(" ");
      const firstName = nameParts[0] || checkoutData.customer_email;
      const lastName = nameParts.slice(1).join(" ") || firstName;

      const customer = await findOrCreateCustomer({
        email: checkoutData.customer_email,
        firstName,
        lastName,
        phone: checkoutData.customer_phone,
      });

      const va = await createVirtualAccount({
        customerId: customer.id,
        amount: checkoutData.total_amount,
        reference: txRef,
        narration: checkoutData.customer_name,
      });

      const { data: payment } = await adminClient
        .from("payments")
        .insert({
          flutterwave_reference: txRef,
          virtual_account_number: va.account_number,
          bank_name: va.account_bank_name,
          account_name: va.account_name,
          amount: checkoutData.total_amount,
          payment_status: "pending",
          webhook_payload: {
            checkout_data: checkoutData,
            va_id: va.id,
            customer_id: customer.id,
            expiry_date: va.account_expiration_datetime,
            expires_at: expiresAt,
          },
        })
        .select()
        .single();

      return {
        id: payment?.id || "",
        flutterwave_reference: txRef,
        virtual_account_number: va.account_number,
        bank_name: va.account_bank_name,
        account_name: va.account_name,
        amount: checkoutData.total_amount,
        payment_status: "pending",
        reference: txRef,
        expires_at: expiresAt,
      };
    } catch {
      // Fall through to manual payment below
    }
  }

  const { data: payment } = await adminClient
    .from("payments")
    .insert({
      flutterwave_reference: txRef,
      virtual_account_number: "",
      bank_name: "Bank Transfer",
      account_name: checkoutData.customer_name,
      amount: checkoutData.total_amount,
      payment_status: "pending",
      webhook_payload: {
        checkout_data: checkoutData,
        expires_at: expiresAt,
      },
    })
    .select()
    .single();

  return {
    id: payment?.id || "",
    flutterwave_reference: txRef,
    virtual_account_number: null,
    bank_name: null,
    account_name: null,
    amount: checkoutData.total_amount,
    payment_status: "pending",
    reference: txRef,
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

  return order;
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
    virtual_account_number?: string;
    bank_name?: string;
    account_name?: string;
    amount?: number;
    payment_status?: string;
  } | null;

  if (payment?.flutterwave_reference && order.payment_status === "pending") {
    try {
      const charge = await getCharge(payment.flutterwave_reference);
      if (charge && charge.status === "successful") {
        await supabase
          .from("payments")
          .update({
            payment_status: "paid",
            paid_at: charge.paid_at || new Date().toISOString(),
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
