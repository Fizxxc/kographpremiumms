-- Perbaikan inventory + public order lookup

alter table if exists public.products
  add column if not exists stock integer not null default 0,
  add column if not exists sold_count integer not null default 0;

update public.products
set stock = coalesce(stock, 0),
    sold_count = coalesce(sold_count, 0)
where stock is null or sold_count is null;

create index if not exists idx_transactions_order_public_code
  on public.transactions (order_id, public_order_code);

create index if not exists idx_wallet_topups_order_public_code
  on public.wallet_topups (order_id, public_order_code);

create or replace function public.increment_product_stock(
  p_product_id uuid,
  p_delta integer,
  p_sold_delta integer default 0
)
returns public.products
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product public.products;
begin
  update public.products
  set stock = greatest(coalesce(stock, 0) + coalesce(p_delta, 0), 0),
      sold_count = greatest(coalesce(sold_count, 0) + coalesce(p_sold_delta, 0), 0),
      updated_at = now()
  where id = p_product_id
  returning * into v_product;

  return v_product;
end;
$$;
