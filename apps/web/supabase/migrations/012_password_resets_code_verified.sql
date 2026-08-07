-- 012: Track when a reset code has been verified (before password change).
-- Added in its own migration so it applies whether or not an older 011 was
-- already applied on a given environment.
alter table password_resets
  add column if not exists code_verified_at timestamptz;