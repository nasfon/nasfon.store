import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getCart, clearCart } from "./cart.service";
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

  const result = await processPayment(supabase, items, data);

  await clearCart();

  return result;
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

  return processPayment(supabase, items, {
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    delivery_location_id: data.delivery_location_id,
    notes: data.notes,
    user_id: data.user_id,
  });
}

async function processPayment(
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

  const payment = await generatePayment({
    items: cartItems.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
    customer_name: data.customer_name,
    customer_email: data.customer_email,
    customer_phone: data.customer_phone,
    delivery_location_id: data.delivery_location_id,
    delivery_fee: deliveryFee,
    subtotal,
    total_amount: totalAmount,
    notes: data.notes,
    user_id: data.user_id,
  });

  return { payment };
}
