-- ============================================================
-- NasFon Store — Initial Database Schema
-- ============================================================

-- 0. Extensions
-- ============================================================

create extension if not exists "uuid-ossp";

-- 1. Enums
-- ============================================================

create type user_role as enum ('customer', 'admin');
create type payment_status as enum ('pending', 'paid', 'failed', 'expired', 'refunded');
create type order_status as enum (
  'pending',
  'payment_confirmed',
  'processing',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- 2. Tables
-- ============================================================

-- 2.1 users
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone_number text,
  role user_role not null default 'customer',
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.2 categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.3 products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  sku text not null unique,
  selling_price numeric(10, 2) not null check (selling_price >= 0),
  compare_price numeric(10, 2) check (compare_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  brand text,
  featured_image text,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.4 product_images
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- 2.5 delivery_locations
create table if not exists delivery_locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  delivery_fee numeric(10, 2) not null default 0 check (delivery_fee >= 0),
  estimated_delivery_days integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.6 payments
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  flutterwave_reference text not null unique,
  virtual_account_number text not null,
  bank_name text not null,
  account_name text not null,
  amount numeric(10, 2) not null check (amount >= 0),
  payment_status payment_status not null default 'pending',
  paid_at timestamptz,
  webhook_payload jsonb,
  created_at timestamptz not null default now()
);

-- 2.7 orders
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references users(id) on delete set null,
  payment_id uuid references payments(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_location_id uuid not null references delivery_locations(id) on delete restrict,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  delivery_fee numeric(10, 2) not null check (delivery_fee >= 0),
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  payment_status payment_status not null default 'pending',
  order_status order_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.8 order_items
create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid not null references products(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0)
);

-- 2.9 reviews
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  order_id uuid not null references orders(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id, product_id, order_id)
);

-- 2.10 settings
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  support_phone text,
  support_email text,
  store_address text,
  return_policy text,
  privacy_policy text,
  terms_conditions text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Indexes
-- ============================================================

create index if not exists idx_users_email on users(email);
create index if not exists idx_users_phone on users(phone_number);

create index if not exists idx_categories_slug on categories(slug);

create index if not exists idx_products_slug on products(slug);
create index if not exists idx_products_sku on products(sku);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_featured on products(is_featured);

create index if not exists idx_product_images_product on product_images(product_id);
create index if not exists idx_product_images_order on product_images(display_order);

create index if not exists idx_orders_number on orders(order_number);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_payment on orders(payment_id);
create index if not exists idx_orders_payment_status on orders(payment_status);
create index if not exists idx_orders_order_status on orders(order_status);
create index if not exists idx_orders_delivery_location on orders(delivery_location_id);

create index if not exists idx_order_items_order on order_items(order_id);
create index if not exists idx_order_items_product on order_items(product_id);

create index if not exists idx_payments_reference on payments(flutterwave_reference);

create index if not exists idx_reviews_product on reviews(product_id);
create index if not exists idx_reviews_user on reviews(user_id);
create index if not exists idx_reviews_visible on reviews(is_visible);

-- 4. Updated-at trigger function
-- ============================================================

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 5. Apply updated-at triggers
-- ============================================================

create trigger set_updated_at before update on users
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on categories
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on products
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on delivery_locations
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on orders
  for each row execute function trigger_set_updated_at();

create trigger set_updated_at before update on settings
  for each row execute function trigger_set_updated_at();

-- 6. Row Level Security
-- ============================================================

alter table users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table delivery_locations enable row level security;
alter table payments enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table reviews enable row level security;
alter table settings enable row level security;

-- 6.1 users
create policy "Users can read own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

create policy "Admins can read all users"
  on users for select
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Admins can update all users"
  on users for update
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.2 categories
create policy "Anyone can read active categories"
  on categories for select
  using (is_active = true);

create policy "Admins can manage categories"
  on categories for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.3 products
create policy "Anyone can read active products"
  on products for select
  using (is_active = true);

create policy "Admins can manage products"
  on products for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.4 product_images
create policy "Anyone can read product images"
  on product_images for select
  using (true);

create policy "Admins can manage product images"
  on product_images for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.5 delivery_locations
create policy "Anyone can read active delivery locations"
  on delivery_locations for select
  using (is_active = true);

create policy "Admins can manage delivery locations"
  on delivery_locations for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.6 payments
create policy "Customers can read own payment"
  on payments for select
  using (exists (
    select 1 from orders
    where orders.payment_id = payments.id
    and orders.user_id = auth.uid()
  ));

create policy "Admins can manage payments"
  on payments for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.7 orders
create policy "Customers can read own orders"
  on orders for select
  using (user_id = auth.uid());

create policy "Admins can manage orders"
  on orders for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.8 order_items
create policy "Customers can read own order items"
  on order_items for select
  using (exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.user_id = auth.uid()
  ));

create policy "Admins can manage order items"
  on order_items for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.9 reviews
create policy "Anyone can read visible reviews"
  on reviews for select
  using (is_visible = true);

create policy "Customers can create reviews for delivered orders"
  on reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from orders
      where orders.id = order_id
      and orders.user_id = auth.uid()
      and orders.order_status = 'delivered'
    )
  );

create policy "Customers can update own reviews"
  on reviews for update
  using (user_id = auth.uid());

create policy "Admins can manage reviews"
  on reviews for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 6.10 settings
create policy "Anyone can read settings"
  on settings for select
  using (true);

create policy "Admins can manage settings"
  on settings for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 7. Seed data
-- ============================================================

-- Insert initial admin user (run after creating admin via Supabase Auth)
-- Replace the UUID below with the actual auth.users id
-- insert into users (id, full_name, email, role)
-- values ('<AUTH_USER_ID>', 'Admin', 'admin@nasfonstore.com', 'admin');

-- Insert default store settings
insert into settings (support_phone, support_email, store_address)
values (null, null, null)
on conflict do nothing;
