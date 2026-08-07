-- 010: Pending registrations (account created only after OTP verification)
-- Stores a staged signup until the user verifies their email. The password is
-- stored encrypted (AES-256-GCM) so the auth user is only created on verify.
create table if not exists pending_registrations (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  phone_number text,
  password_enc text not null,
  password_iv text not null,
  password_tag text not null,
  otp_hash text not null,
  otp_expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_pending_registrations_email
  on pending_registrations(email);

alter table pending_registrations enable row level security;
-- Service-role client (which bypasses RLS) handles all pending registration
-- inserts/reads.