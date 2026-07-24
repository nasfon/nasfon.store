-- ============================================================
-- Make payment VA fields nullable (not all methods use VAs)
-- ============================================================

alter table payments
  alter column virtual_account_number drop not null,
  alter column bank_name drop not null,
  alter column account_name drop not null;
