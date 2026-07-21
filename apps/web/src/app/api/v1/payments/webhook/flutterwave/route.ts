import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    if (!secretHash) {
      return new Response("Webhook not configured", { status: 503 });
    }

    const signature = request.headers.get("verif-hash");
    if (!signature || signature !== secretHash) {
      return new Response("Invalid signature", { status: 401 });
    }

    const body = await request.json();

    if (body.event === "charge.completed" && body.data.status === "successful") {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);

      const { data: existingPayment } = await supabase
        .from("payments")
        .select("id")
        .eq("flutterwave_reference", body.data.tx_ref)
        .single();

      if (existingPayment) {
        return new Response("Already processed", { status: 200 });
      }

      const { data: payment } = await supabase
        .from("payments")
        .insert({
          flutterwave_reference: body.data.tx_ref,
          virtual_account_number: body.data.account_number || "",
          bank_name: body.data.bank_name || "",
          account_name: body.data.account_name || "",
          amount: body.data.amount,
          payment_status: "paid",
          paid_at: body.data.paid_at || new Date().toISOString(),
          webhook_payload: body,
        })
        .select()
        .single();

      if (payment) {
        await supabase
          .from("orders")
          .update({
            payment_id: payment.id,
            payment_status: "paid",
            order_status: "payment_confirmed",
          })
          .eq("order_number", body.data.tx_ref);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
