-- Pakasir gateway upgrade for Kograph Premium
-- Jalankan file ini di Supabase SQL Editor pada project yang sudah ada.

begin;

alter table if exists public.transactions
  add column if not exists gateway_name text not null default 'pakasir',
  add column if not exists gateway_reference text,
  add column if not exists gateway_payload jsonb not null default '{}'::jsonb;

alter table if exists public.wallet_topups
  add column if not exists gateway_name text not null default 'pakasir',
  add column if not exists gateway_reference text,
  add column if not exists gateway_payload jsonb not null default '{}'::jsonb;

alter table if exists public.transactions
  alter column snap_token drop not null;

alter table if exists public.wallet_topups
  add column if not exists fulfillment_data jsonb not null default '{}'::jsonb;

update public.transactions
set gateway_name = 'pakasir'
where gateway_name is null or gateway_name = '';

update public.wallet_topups
set gateway_name = 'pakasir'
where gateway_name is null or gateway_name = '';

create index if not exists transactions_gateway_name_idx on public.transactions (gateway_name);
create index if not exists transactions_gateway_reference_idx on public.transactions (gateway_reference);
create index if not exists wallet_topups_gateway_name_idx on public.wallet_topups (gateway_name);
create index if not exists wallet_topups_gateway_reference_idx on public.wallet_topups (gateway_reference);

comment on column public.transactions.gateway_name is 'Gateway pembayaran aktif. Untuk versi ini memakai pakasir.';
comment on column public.transactions.gateway_reference is 'Referensi transaksi dari gateway pembayaran.';
comment on column public.transactions.gateway_payload is 'Payload mentah dari gateway pembayaran.';
comment on column public.wallet_topups.gateway_name is 'Gateway pembayaran aktif. Untuk versi ini memakai pakasir.';
comment on column public.wallet_topups.gateway_reference is 'Referensi transaksi dari gateway pembayaran.';
comment on column public.wallet_topups.gateway_payload is 'Payload mentah dari gateway pembayaran.';

commit;
