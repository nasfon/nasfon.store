-- 011: Password reset codes (sent via Resend, like OTP)
-- Replaces Supabase's built-in recovery mailer (which 500s on free tier).
create table if not exists password_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_password_resets_email
  on password_resets(email);

alter table password_resets enable row level security;
-- Service-role client (which bypasses RLS) handles all password reset reads/inserts.