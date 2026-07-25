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

Run the automated seed script:
```bash
cd apps/web && npm run seed:admin
```

This creates the auth user and inserts the admin role record.

Or manually:
1. Go to **Authentication → Users** → **Add User**
2. Create an admin account (e.g., `admin@nasfonstore.com`)
3. Copy the user's UUID and run `supabase/seed-admin.sql` in SQL Editor

## 5. Seed Data (Optional)

Run `supabase/seed.sql` in SQL Editor for sample categories, products, and delivery locations.
