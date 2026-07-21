import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getCart } from "./cart.service";
import { generatePayment } from "./payment.service";

export async function createCheckout(data: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_location_id: string;
  notes?: string;
  user_id?: string | null;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { items } = await getCart();
  if (items.length === 0) throw new Error("Cart is empty");

  return processOrder(supabase, items, data);
}

export async function buyNow(data: {
  product_id: string;
  quantity: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_location_id: string;
  notes?: string;
  user_id?: string | null;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const items = [{ product_id: data.product_id, quantity: data.quantity, added_at: new Date().toISOString() }];

  return processOrder(supabase, items, {
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    delivery_location_id: data.delivery_location_id,
    notes: data.notes,
    user_id: data.user_id,
  });
}

async function processOrder(
  supabase: ReturnType<typeof createClient>,
  cartItems: { product_id: string; quantity: number }[],
  data: {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_location_id: string;
    notes?: string;
    user_id?: string | null;
  }
) {
  const productIds = cartItems.map((i) => i.product_id);
  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, selling_price, stock_quantity, is_active")
    .in("id", productIds);

  if (prodError) throw new Error("Failed to validate products");

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

  for (const item of cartItems) {
    const product = productMap.get(item.product_id);
    if (!product) throw new Error(`Product ${item.product_id} not found`);
    if (!product.is_active) throw new Error(`${product.name} is no longer available`);
    if (product.stock_quantity < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.product_id)!;
    return sum + product.selling_price * item.quantity;
  }, 0);

  const { data: location, error: locError } = await supabase
    .from("delivery_locations")
    .select("id, delivery_fee, is_active")
    .eq("id", data.delivery_location_id)
    .single();

  if (locError || !location || !location.is_active) {
    throw new Error("Invalid delivery location");
  }

  const deliveryFee = location.delivery_fee;
  const totalAmount = subtotal + deliveryFee;

  const orderNumber = `NF-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: data.user_id || null,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      customer_phone: data.customer_phone,
      delivery_location_id: data.delivery_location_id,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      payment_status: "pending",
      order_status: "pending",
      notes: data.notes || null,
    })
    .select()
    .single();

  if (orderError) throw new Error("Failed to create order");

  const orderItems = cartItems.map((item) => {
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

  for (const item of cartItems) {
    const product = productMap.get(item.product_id)!;
    await supabase
      .from("products")
      .update({ stock_quantity: product.stock_quantity - item.quantity })
      .eq("id", item.product_id);
  }

  const payment = await generatePayment(order.id, totalAmount, data.customer_email, data.customer_name);

  return { order, payment };
}
