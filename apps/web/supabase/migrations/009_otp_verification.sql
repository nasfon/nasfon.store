-- 009: OTP email verification
-- Tracks whether an account has verified their email (set to NOT NULL on signup)
alter table users
  add column if not exists email_verified_at timestamptz;

-- Backfill existing users as verified so they are not locked out.
update users set email_verified_at = now() where email_verified_at is null;

-- One-time passcodes sent to the user by email.
create table if not exists otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  purpose text not null check (purpose in ('signup', 'login')),
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_codes_user_purpose
  on otp_codes(user_id, purpose);

alter table otp_codes enable row level security;
-- Service-role client (which bypasses RLS) handles all OTP inserts/reads.