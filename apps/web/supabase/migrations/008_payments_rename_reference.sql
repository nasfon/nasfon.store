-- ============================================================
-- Rename legacy Flutterwave column to neutral `reference`.
-- Guarded so it's safe to run on DBs that already use `reference`.
-- Also add `provider` column if missing.
-- ============================================================

do $$
begin
  -- rename legacy column if it still exists
  if exists (
    select 1 from information_schema.columns
    where table_name = 'payments' and column_name = 'flutterwave_reference'
  ) then
    if not exists (
      select 1 from information_schema.columns
      where table_name = 'payments' and column_name = 'reference'
    ) then
      alter table payments rename column flutterwave_reference to reference;
      alter index idx_payments_reference rename to idx_payments_reference;
    else
      alter table payments drop column flutterwave_reference;
    end if;
  end if;

  -- add provider column if missing
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'payments' and column_name = 'provider'
  ) then
    alter table payments add column provider text;
  end if;
end $$;