-- 013: Sanitize review text at the database layer.
-- Reviews can be inserted directly via the Supabase anon client (RLS allows
-- inserts for delivered orders), which would bypass API-route sanitization.
-- This trigger strips HTML/control characters so stored review text can never
-- contain scriptable markup.
create or replace function sanitize_review_text()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.review is not null then
    new.review := left(
      trim(regexp_replace(new.review, '[<>&"'']', '', 'g'))
    , 2000);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reviews_sanitize on reviews;
create trigger trg_reviews_sanitize
  before insert or update on reviews
  for each row
  execute function sanitize_review_text();
