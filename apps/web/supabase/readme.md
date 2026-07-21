# Supabase Setup

## 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Copy the project URL and anon key to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 2. Run Migrations

Open the **SQL Editor** in Supabase Dashboard and run the migration files in order:

1. `supabase/migrations/001_initial_schema.sql`

## 3. Enable Authentication

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Ensure **Email** provider is enabled
3. (Optional) Disable "Confirm email" for MVP

## 4. Create Admin User

1. Go to **Authentication → Users** → **Add User**
2. Create an admin account (e.g., `admin@nasfonstore.com`)
3. Run the following in SQL Editor (replace the UUID):
   ```sql
   insert into users (id, full_name, email, role)
   values ('<USER_ID_FROM_AUTH>', 'Admin', 'admin@nasfonstore.com', 'admin');
   ```

## 5. Seed Data (Optional)

Run `supabase/seed.sql` for sample categories and products.
