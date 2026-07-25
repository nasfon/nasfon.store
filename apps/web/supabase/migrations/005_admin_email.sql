-- ============================================================
-- NasFon Store — Add admin_email to settings
-- ============================================================

alter table settings
  add column if not exists admin_email text;
