export type UserRole = "customer" | "admin";

export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";

export type OrderStatus =
  | "pending"
  | "payment_confirmed"
  | "processing"
  | "ready_for_delivery"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type AccountStatus = "active" | "suspended" | "deleted";

export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string;
  selling_price: number;
  compare_price: number | null;
  stock_quantity: number;
  brand: string | null;
  featured_image: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface DeliveryLocation {
  id: string;
  name: string;
  delivery_fee: number;
  estimated_delivery_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  payment_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_location_id: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  delivery_location?: DeliveryLocation;
  payment?: Payment;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  product?: Product;
}

export interface Payment {
  id: string;
  flutterwave_reference: string;
  virtual_account_number: string;
  bank_name: string;
  account_name: string;
  amount: number;
  payment_status: PaymentStatus;
  paid_at: string | null;
  webhook_payload: unknown;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  review: string | null;
  is_visible: boolean;
  created_at: string;
  user?: Pick<User, "full_name" | "avatar_url">;
}

export interface StoreSettings {
  id: string;
  support_phone: string | null;
  support_email: string | null;
  store_address: string | null;
  return_policy: string | null;
  privacy_policy: string | null;
  terms_conditions: string | null;
  admin_email: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
