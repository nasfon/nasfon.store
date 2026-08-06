-- ============================================================
-- NasFon Store — Seller (Multi-Vendor) Migration
-- ============================================================

-- 1. Create Sellers Table
-- ============================================================
create table if not exists sellers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade unique,
  shop_name text not null,
  shop_slug text not null unique,
  shop_address text not null,
  shop_logo_url text,
  contact_phone text not null,
  contact_email text not null,
  support_contact text,
  business_description text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'approved', 'rejected')),
  verification_documents jsonb not null default '[]'::jsonb,
  paystack_public_key text,
  paystack_secret_key text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Alter Products & Delivery Locations to link sellers
-- ============================================================
alter table products add column if not exists seller_id uuid references sellers(id) on delete set null;
alter table delivery_locations add column if not exists seller_id uuid references sellers(id) on delete set null;

-- 3. Indexes
-- ============================================================
create index if not exists idx_sellers_user on sellers(user_id);
create index if not exists idx_sellers_slug on sellers(shop_slug);
create index if not exists idx_sellers_status on sellers(verification_status);
create index if not exists idx_products_seller on products(seller_id);
create index if not exists idx_delivery_locations_seller on delivery_locations(seller_id);

-- 4. Updated-at trigger for sellers
-- ============================================================
create trigger set_updated_at before update on sellers
  for each row execute function trigger_set_updated_at();

-- 5. Row Level Security (RLS)
-- ============================================================
alter table sellers enable row level security;

-- 5.1 Sellers Policies
create policy "Anyone can read approved active sellers"
  on sellers for select
  using (verification_status = 'approved' and is_active = true);

create policy "Users can view own seller application"
  on sellers for select
  using (user_id = auth.uid());

create policy "Users can apply/insert own seller profile"
  on sellers for insert
  with check (user_id = auth.uid());

create policy "Users can update own seller profile"
  on sellers for update
  using (user_id = auth.uid());

create policy "Admins can manage all sellers"
  on sellers for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- 5.2 Update Products Policies for Sellers
create policy "Approved sellers can manage own products"
  on products for all
  using (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.user_id = auth.uid()
      and sellers.verification_status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from sellers
      where sellers.id = products.seller_id
      and sellers.user_id = auth.uid()
      and sellers.verification_status = 'approved'
    )
  );

-- 5.3 Update Delivery Locations Policies for Sellers
create policy "Approved sellers can manage own delivery locations"
  on delivery_locations for all
  using (
    exists (
      select 1 from sellers
      where sellers.id = delivery_locations.seller_id
      and sellers.user_id = auth.uid()
      and sellers.verification_status = 'approved'
    )
  )
  with check (
    exists (
      select 1 from sellers
      where sellers.id = delivery_locations.seller_id
      and sellers.user_id = auth.uid()
      and sellers.verification_status = 'approved'
    )
  );

-- 5.4 Update Order Items / Orders policies so sellers can view and manage orders containing their products
create policy "Sellers can read orders containing their products"
  on orders for select
  using (
    exists (
      select 1 from order_items oi
      join products p on p.id = oi.product_id
      join sellers s on s.id = p.seller_id
      where oi.order_id = orders.id
      and s.user_id = auth.uid()
      and s.verification_status = 'approved'
    )
  );

create policy "Sellers can update orders containing their products"
  on orders for update
  using (
    exists (
      select 1 from order_items oi
      join products p on p.id = oi.product_id
      join sellers s on s.id = p.seller_id
      where oi.order_id = orders.id
      and s.user_id = auth.uid()
      and s.verification_status = 'approved'
    )
  );

create policy "Sellers can read order items for their products"
  on order_items for select
  using (
    exists (
      select 1 from products p
      join sellers s on s.id = p.seller_id
      where p.id = order_items.product_id
      and s.user_id = auth.uid()
      and s.verification_status = 'approved'
    )
  );
