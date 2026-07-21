# Commit 002

**Message:** Add database schema migration, RLS policies, and Supabase setup guide

**Date:** 2026-07-21

---

## Changes

### Database
- Created `supabase/migrations/001_initial_schema.sql` with:
  - All 10 tables: `users`, `categories`, `products`, `product_images`, `delivery_locations`, `payments`, `orders`, `order_items`, `reviews`, `settings`
  - Enums: `user_role`, `payment_status`, `order_status`
  - Indexes on all search/lookup fields
  - `updated_at` trigger function and triggers on all relevant tables
  - Row Level Security policies for guests, customers, and admins
  - Default store settings seed

### Documentation
- Created `supabase/readme.md` with step-by-step Supabase setup guide

### Git Config
- Set user name to `nasfon` and email to `nasfonsupport@gmail.com`
- Added SSH deploy key for `nasfon/nasfon.store` repo
- Fixed stray git config entry
