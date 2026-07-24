-- ============================================================
-- NasFon Store — Add Full-Text Search for Products
-- ============================================================

-- 1. Add tsvector column to products
alter table products
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(brand, '') || ' ' ||
      coalesce(description, '')
    )
  ) stored;

-- 2. GIN index for fast full-text search
create index if not exists products_search_idx
  on products
  using gin(search_vector);

-- 3. Trigger to keep search_vector updated on changes
create or replace function products_search_vector_update()
returns trigger as $$
begin
  new.search_vector := to_tsvector('english',
    coalesce(new.name, '') || ' ' ||
    coalesce(new.brand, '') || ' ' ||
    coalesce(new.description, '')
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_search_vector on products;
create trigger trg_products_search_vector
  before insert or update of name, brand, description
  on products
  for each row
  execute function products_search_vector_update();
