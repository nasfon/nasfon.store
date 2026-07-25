-- ============================================================
-- Admin User Seed
-- ============================================================
-- Prerequisite: Create an admin user in Supabase Auth first:
--   1. Go to Authentication → Users → Add User
--   2. Create user with email (e.g., admin@nasfonstore.com)
--   3. Copy the new user's UUID from the table
-- ============================================================

-- Replace the UUID below with the actual auth.users id from step above
insert into users (id, full_name, email, role)
values ('<REPLACE_WITH_AUTH_USER_ID>', 'Admin', 'admin@nasfonstore.com', 'admin')
on conflict (id) do nothing;
