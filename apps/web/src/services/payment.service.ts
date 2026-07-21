import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface PaymentResult {
  id: string;
  flutterwave_reference: string;
  virtual_account_number: string | null;
  bank_name: string | null;
  account_name: string | null;
  amount: number;
  payment_status: string;
  reference: string;
}

export async function generatePayment(orderId: string, amount: number, email: string, fullname: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  const txRef = `NF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  if (flutterwaveSecretKey) {
    try {
      const response = await fetch(
        "https://api.flutterwave.com/v3/virtual-account-numbers",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${flutterwaveSecretKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount,
            tx_ref: txRef,
            fullname: fullname || email,
            is_permanent: false,
            meta: { order_id: orderId },
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const { data: payment } = await supabase
          .from("payments")
          .insert({
            flutterwave_reference: txRef,
            virtual_account_number: data.data.account_number,
            bank_name: data.data.bank_name,
            account_name: data.data.account_name,
            amount,
            payment_status: "pending",
          })
          .select()
          .single();

        if (payment) {
          await supabase
            .from("orders")
            .update({ payment_id: payment.id })
            .eq("id", orderId);
        }

        return {
          id: payment?.id || "",
          flutterwave_reference: txRef,
          virtual_account_number: data.data.account_number,
          bank_name: data.data.bank_name,
          account_name: data.data.account_name,
          amount,
          payment_status: "pending",
          reference: txRef,
        };
      }
    } catch {
      // Fall through to manual payment below
    }
  }

  const { data: payment } = await supabase
    .from("payments")
    .insert({
      flutterwave_reference: txRef,
      virtual_account_number: null,
      bank_name: null,
      account_name: null,
      amount,
      payment_status: "pending",
    })
    .select()
    .single();

  if (payment) {
    await supabase
      .from("orders")
      .update({ payment_id: payment.id })
      .eq("id", orderId);
  }

  return {
    id: payment?.id || "",
    flutterwave_reference: txRef,
    virtual_account_number: null,
    bank_name: null,
    account_name: null,
    amount,
    payment_status: "pending",
    reference: txRef,
  };
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

  const flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  if (payment?.flutterwave_reference && flutterwaveSecretKey && order.payment_status === "pending") {
    try {
      const response = await fetch(
        `https://api.flutterwave.com/v3/transactions/by_reference/${payment.flutterwave_reference}`,
        { headers: { Authorization: `Bearer ${flutterwaveSecretKey}` } }
      );
      const data = await response.json();

      if (data.status === "success" && data.data.status === "successful") {
        await supabase
          .from("payments")
          .update({
            payment_status: "paid",
            paid_at: data.data.paid_at || new Date().toISOString(),
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
