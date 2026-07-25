-- ============================================================
-- Seed Data: Categories, Products, Delivery Locations
-- ============================================================
-- Run this after the initial migration has been applied.
-- Can be run multiple times safely (uses on conflict do nothing).
-- ============================================================

-- Categories
insert into categories (name, slug, description, is_active) values
  ('Smartphones', 'smartphones', 'Latest smartphones and accessories', true),
  ('Laptops', 'laptops', 'Laptops for work, study, and gaming', true),
  ('Audio', 'audio', 'Headphones, earphones, and speakers', true),
  ('Accessories', 'accessories', 'Phone cases, chargers, cables, and more', true),
  ('Gaming', 'gaming', 'Consoles, games, and gaming accessories', true)
on conflict (slug) do nothing;

-- Products (referencing categories by slug)
do $$
declare
  cat_smartphones  uuid; cat_laptops  uuid;
  cat_audio        uuid; cat_accessories uuid; cat_gaming uuid;
begin
  select id into cat_smartphones  from categories where slug = 'smartphones';
  select id into cat_laptops      from categories where slug = 'laptops';
  select id into cat_audio        from categories where slug = 'audio';
  select id into cat_accessories  from categories where slug = 'accessories';
  select id into cat_gaming       from categories where slug = 'gaming';

  insert into products (category_id, name, slug, description, sku, selling_price, compare_price, stock_quantity, brand, is_featured, is_active) values
    (cat_smartphones, 'iPhone 15 Pro Max', 'iphone-15-pro-max', 'Apple iPhone 15 Pro Max with A17 Pro chip, 256GB storage, and titanium design.', 'IP15PM-256', 1499999, 1599999, 15, 'Apple', true, true),
    (cat_smartphones, 'Samsung Galaxy S24 Ultra', 'samsung-galaxy-s24-ultra', 'Samsung Galaxy S24 Ultra with Snapdragon 8 Gen 3, 256GB, and S Pen.', 'SGS24U-256', 1399999, 1499999, 20, 'Samsung', true, true),
    (cat_smartphones, 'Tecno Camon 20 Pro', 'tecno-camon-20-pro', 'Tecno Camon 20 Pro with 108MP camera and 8GB RAM.', 'TC20P-8', 299999, 349999, 30, 'Tecno', false, true),
    (cat_smartphones, 'Infinix Note 30', 'infinix-note-30', 'Infinix Note 30 with 6.95-inch display and 5000mAh battery.', 'IN30-6', 199999, 249999, 25, 'Infinix', false, true),
    (cat_smartphones, 'Nokia G22', 'nokia-g22', 'Nokia G22 with 6.52-inch display and 50MP camera.', 'NG22-4', 149999, 179999, 10, 'Nokia', false, true),

    (cat_laptops, 'MacBook Air M3', 'macbook-air-m3', 'Apple MacBook Air with M3 chip, 13.6-inch display, 8GB RAM, 256GB SSD.', 'MBA-M3-256', 999999, 1099999, 10, 'Apple', true, true),
    (cat_laptops, 'Dell XPS 15', 'dell-xps-15', 'Dell XPS 15 with Intel Core i7, 16GB RAM, 512GB SSD, FHD+ display.', 'DXPS15-I7', 1299999, 1399999, 8, 'Dell', false, true),
    (cat_laptops, 'HP Pavilion 14', 'hp-pavilion-14', 'HP Pavilion 14 with Ryzen 5, 8GB RAM, 256GB SSD, 14-inch display.', 'HPP14-R5', 549999, 599999, 12, 'HP', false, true),
    (cat_laptops, 'Lenovo ThinkPad X1 Carbon', 'lenovo-thinkpad-x1-carbon', 'Lenovo ThinkPad X1 Carbon Gen 11, Intel i7, 16GB RAM, 512GB SSD.', 'LTX1C-G11', 1199999, 1299999, 5, 'Lenovo', false, true),

    (cat_audio, 'Sony WH-1000XM5', 'sony-wh-1000xm5', 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones.', 'SONY-XM5', 449999, 499999, 20, 'Sony', true, true),
    (cat_audio, 'AirPods Pro 2', 'airpods-pro-2', 'Apple AirPods Pro 2nd Gen with USB-C and Active Noise Cancellation.', 'APP2-USB', 299999, 349999, 25, 'Apple', true, true),
    (cat_audio, 'JBL Flip 6', 'jbl-flip-6', 'JBL Flip 6 Portable Bluetooth Speaker with rich bass.', 'JBL-F6', 149999, 179999, 15, 'JBL', false, true),
    (cat_audio, 'Samsung Galaxy Buds2 Pro', 'samsung-galaxy-buds2-pro', 'Samsung Galaxy Buds2 Pro with Hi-Fi sound and ANC.', 'SGB2P', 199999, 249999, 18, 'Samsung', false, true),

    (cat_accessories, 'iPhone 15 Pro Max Case', 'iphone-15-pro-max-case', 'Premium silicone case for iPhone 15 Pro Max.', 'IP15PMC-001', 14999, 19999, 50, 'NasFon', false, true),
    (cat_accessories, 'USB-C Fast Charger 65W', 'usb-c-fast-charger-65w', '65W USB-C GaN fast charger compatible with laptops and phones.', 'GAN65W-001', 34999, 44999, 40, 'NasFon', false, true),
    (cat_accessories, 'Wireless Charging Pad', 'wireless-charging-pad', '15W fast wireless charging pad for all Qi-compatible devices.', 'WCP15W-001', 24999, 29999, 35, 'NasFon', false, true),
    (cat_accessories, 'USB-C to Lightning Cable 2M', 'usb-c-to-lightning-cable-2m', 'Durable braided USB-C to Lightning cable, 2 meters.', 'UCL2M-001', 9999, 14999, 60, 'NasFon', false, true),

    (cat_gaming, 'PlayStation 5 Slim', 'playstation-5-slim', 'Sony PlayStation 5 Slim Console with 1TB SSD.', 'PS5-SLIM-1T', 599999, 649999, 10, 'Sony', true, true),
    (cat_gaming, 'Xbox Series S', 'xbox-series-s', 'Microsoft Xbox Series S 512GB SSD Console.', 'XBS-S-512', 399999, 449999, 8, 'Microsoft', false, true),
    (cat_gaming, 'Nintendo Switch OLED', 'nintendo-switch-oled', 'Nintendo Switch OLED Model with 7-inch OLED screen.', 'NS-OLED-64', 349999, 399999, 12, 'Nintendo', false, true),
    (cat_gaming, 'DualSense Wireless Controller', 'dualsense-wireless-controller', 'Sony DualSense wireless controller for PS5.', 'DS5-CTRL', 69999, 79999, 30, 'Sony', false, true)
  on conflict (slug) do nothing;
end $$;

-- Delivery locations
insert into delivery_locations (name, delivery_fee, estimated_delivery_days, is_active) values
  ('Lagos Mainland', 2500, 1, true),
  ('Lagos Island', 3500, 1, true),
  ('Abuja', 3500, 2, true),
  ('Port Harcourt', 3500, 2, true),
  ('Ibadan', 3000, 2, true),
  ('Kano', 4000, 3, true),
  ('Kaduna', 4000, 3, true),
  ('Enugu', 3500, 2, true),
  ('Benin City', 3000, 2, true),
  ('Other States', 5000, 5, true)
on conflict (name) do nothing;
