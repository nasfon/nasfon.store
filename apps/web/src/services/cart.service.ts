import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

interface CartItem {
  product_id: string;
  quantity: number;
  added_at: string;
}

interface CartData {
  items: CartItem[];
  updated_at: string;
}

const CART_COOKIE = "cart";

function generateCartId(): string {
  return crypto.randomUUID();
}

export async function getCartId(): Promise<string> {
  const cookieStore = await cookies();
  let cartId = cookieStore.get("cart_id")?.value;
  if (!cartId) {
    cartId = generateCartId();
  }
  return cartId;
}

export async function getCart(): Promise<{ items: CartItem[] }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };

  try {
    const parsed = JSON.parse(atob(raw)) as CartData;
    return { items: parsed.items };
  } catch {
    return { items: [] };
  }
}

export async function setCart(items: CartItem[]) {
  const cookieStore = await cookies();
  const data: CartData = { items, updated_at: new Date().toISOString() };
  const encoded = btoa(JSON.stringify(data));
  cookieStore.set(CART_COOKIE, encoded, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function clearCart() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

export async function addCartItem(productId: string, quantity: number) {
  const { items } = await getCart();
  const existing = items.find((i) => i.product_id === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product_id: productId, quantity, added_at: new Date().toISOString() });
  }

  await setCart(items);
  return { items };
}

export async function updateCartItem(productId: string, quantity: number) {
  const { items } = await getCart();
  const existing = items.find((i) => i.product_id === productId);

  if (!existing) throw new Error("Item not found in cart");

  if (quantity <= 0) {
    return removeCartItem(productId);
  }

  existing.quantity = quantity;
  await setCart(items);
  return { items };
}

export async function removeCartItem(productId: string) {
  const { items } = await getCart();
  const filtered = items.filter((i) => i.product_id !== productId);
  await setCart(filtered);
  return { items: filtered };
}

export async function getCartWithProducts() {
  const { items } = await getCart();
  if (items.length === 0) return { items: [], total: 0 };

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const productIds = items.map((i) => i.product_id);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, selling_price, compare_price, featured_image, stock_quantity, is_active")
    .in("id", productIds);

  const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

  const cartItems = items
    .map((item) => {
      const product = productMap.get(item.product_id);
      if (!product || !product.is_active) return null;
      return {
        product_id: item.product_id,
        quantity: Math.min(item.quantity, product.stock_quantity),
        product: {
          name: product.name,
          slug: product.slug,
          selling_price: product.selling_price,
          compare_price: product.compare_price,
          featured_image: product.featured_image,
          stock_quantity: product.stock_quantity,
        },
        subtotal: product.selling_price * Math.min(item.quantity, product.stock_quantity),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  return { items: cartItems, total };
}
