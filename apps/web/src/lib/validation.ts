import { z } from "zod";

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone_number: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const cartItemSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const checkoutSchema = z.object({
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Invalid email"),
  customer_phone: z.string().min(5, "Phone number is required"),
  delivery_location_id: z.string().uuid("Invalid delivery location"),
  notes: z.string().optional(),
});

export const buyNowSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  quantity: z.number().int().positive().default(1),
  customer_name: z.string().min(2, "Name is required"),
  customer_email: z.string().email("Invalid email"),
  customer_phone: z.string().min(5, "Phone number is required"),
  delivery_location_id: z.string().uuid("Invalid delivery location"),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  product_id: z.string().uuid("Invalid product ID"),
  order_id: z.string().uuid("Invalid order ID"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  review: z.string().max(1000).optional(),
});

export const profileSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().min(5).optional(),
  avatar_url: z.string().url().optional().nullable(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const productQuerySchema = paginationSchema.extend({
  search: z.string().optional(),
  category_id: z.string().uuid().optional(),
  featured: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "newest", "name"]).optional(),
});

export const orderTrackSchema = z.object({
  order_number: z.string().min(1, "Order number is required"),
  phone_number: z.string().min(5, "Phone number is required"),
});

export const adminProductSchema = z.object({
  category_id: z.string().uuid("Invalid category"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  sku: z.string().min(1, "SKU is required"),
  selling_price: z.number().positive("Price must be positive"),
  compare_price: z.number().positive().optional().nullable(),
  stock_quantity: z.number().int().min(0, "Stock cannot be negative").default(0),
  brand: z.string().optional().nullable(),
  featured_image: z.string().optional().nullable(),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const adminProductUpdateSchema = adminProductSchema.partial();

export const adminCategorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug is required"),
  description: z.string().optional().nullable(),
  image_url: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

export const adminCategoryUpdateSchema = adminCategorySchema.partial();

export const adminOrderUpdateSchema = z.object({
  order_status: z.enum(["pending", "payment_confirmed", "processing", "ready_for_delivery", "out_for_delivery", "delivered", "cancelled"]).optional(),
  payment_status: z.enum(["pending", "paid", "failed", "expired", "refunded"]).optional(),
  notes: z.string().optional().nullable(),
});

export const adminDeliveryLocationSchema = z.object({
  name: z.string().min(2, "Name is required"),
  delivery_fee: z.number().min(0, "Fee cannot be negative"),
  estimated_delivery_days: z.number().int().positive("Must be at least 1 day"),
  is_active: z.boolean().default(true),
});

export const adminDeliveryLocationUpdateSchema = adminDeliveryLocationSchema.partial();

export const adminCustomerUpdateSchema = z.object({
  full_name: z.string().min(2).optional(),
  phone_number: z.string().min(5).optional(),
  is_active: z.boolean().optional(),
});

export const adminSettingsSchema = z.object({
  support_phone: z.string().optional().nullable(),
  support_email: z.string().email().optional().nullable(),
  store_address: z.string().optional().nullable(),
  return_policy: z.string().optional().nullable(),
  privacy_policy: z.string().optional().nullable(),
  terms_conditions: z.string().optional().nullable(),
});
