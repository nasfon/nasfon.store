-- ============================================================
-- Fix RLS infinite recursion caused by policies querying users
-- ============================================================

-- Helper function that reads user role bypassing RLS
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.users where id = auth.uid()
$$;

-- 6.1 users
drop policy if exists "Admins can read all users" on users;
create policy "Admins can read all users"
  on users for select
  using (public.get_user_role() = 'admin');

drop policy if exists "Admins can update all users" on users;
create policy "Admins can update all users"
  on users for update
  using (public.get_user_role() = 'admin');

-- 6.2 categories
drop policy if exists "Admins can manage categories" on categories;
create policy "Admins can manage categories"
  on categories for all
  using (public.get_user_role() = 'admin');

-- 6.3 products
drop policy if exists "Admins can manage products" on products;
create policy "Admins can manage products"
  on products for all
  using (public.get_user_role() = 'admin');

-- 6.4 product_images
drop policy if exists "Admins can manage product images" on product_images;
create policy "Admins can manage product images"
  on product_images for all
  using (public.get_user_role() = 'admin');

-- 6.5 delivery_locations
drop policy if exists "Admins can manage delivery locations" on delivery_locations;
create policy "Admins can manage delivery locations"
  on delivery_locations for all
  using (public.get_user_role() = 'admin');

-- 6.6 payments
drop policy if exists "Admins can manage payments" on payments;
create policy "Admins can manage payments"
  on payments for all
  using (public.get_user_role() = 'admin');

-- 6.7 orders
drop policy if exists "Admins can manage orders" on orders;
create policy "Admins can manage orders"
  on orders for all
  using (public.get_user_role() = 'admin');

-- 6.8 order_items
drop policy if exists "Admins can manage order items" on order_items;
create policy "Admins can manage order items"
  on order_items for all
  using (public.get_user_role() = 'admin');

-- 6.9 reviews
drop policy if exists "Admins can manage reviews" on reviews;
create policy "Admins can manage reviews"
  on reviews for all
  using (public.get_user_role() = 'admin');

-- 6.10 settings
drop policy if exists "Admins can manage settings" on settings;
create policy "Admins can manage settings"
  on settings for all
  using (public.get_user_role() = 'admin');
