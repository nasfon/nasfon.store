-- ============================================================
-- NasFon Store — Fix seller foreign keys
-- The products.seller_id and delivery_locations.seller_id columns
-- were created referencing users(id) instead of sellers(id).
-- Run this in the Supabase SQL editor.
-- ============================================================

-- 1. Drop the incorrect foreign key constraints
alter table products drop constraint if exists products_seller_id_fkey;
alter table delivery_locations drop constraint if exists delivery_locations_seller_id_fkey;

-- 2. Repair orphaned rows: rows whose seller_id currently holds a users.id
--    should be remapped to the matching seller id via sellers.user_id
update products
set seller_id = s.id
from users u
join sellers s on s.user_id = u.id
where products.seller_id = u.id;

update delivery_locations
set seller_id = s.id
from users u
join sellers s on s.user_id = u.id
where delivery_locations.seller_id = u.id;

-- 3. Re-add the correct foreign key constraints referencing sellers(id)
alter table products add constraint products_seller_id_fkey
  foreign key (seller_id) references sellers(id) on delete set null;

alter table delivery_locations add constraint delivery_locations_seller_id_fkey
  foreign key (seller_id) references sellers(id) on delete set null;
