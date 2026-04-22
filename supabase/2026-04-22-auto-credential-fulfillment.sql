begin;

create or replace function public.fulfill_transaction(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions%rowtype;
  v_existing public.app_credentials%rowtype;
  v_credential public.app_credentials%rowtype;
  v_fulfillment jsonb;
  v_inventory_applied boolean;
  v_coupon_applied boolean;
begin
  select *
  into v_tx
  from public.transactions
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'Transaction not found for order_id: %', p_order_id;
  end if;

  select *
  into v_existing
  from public.app_credentials
  where transaction_id = v_tx.id
  order by created_at asc
  limit 1;

  if v_existing.id is null and coalesce(v_tx.status, '') in ('settlement', 'success', 'completed', 'paid') then
    select *
    into v_credential
    from public.app_credentials
    where product_id = v_tx.product_id
      and coalesce(is_used, false) = false
      and transaction_id is null
    order by created_at asc
    limit 1
    for update skip locked;

    if found then
      update public.app_credentials
      set is_used = true,
          transaction_id = v_tx.id,
          updated_at = now()
      where id = v_credential.id
      returning * into v_existing;
    end if;
  end if;

  if v_existing.id is null and coalesce(v_tx.status, '') not in ('settlement', 'success', 'completed', 'paid') then
    update public.transactions
    set status = 'settlement',
        paid_at = coalesce(paid_at, now()),
        updated_at = now()
    where id = v_tx.id
    returning * into v_tx;

    select *
    into v_credential
    from public.app_credentials
    where product_id = v_tx.product_id
      and coalesce(is_used, false) = false
      and transaction_id is null
    order by created_at asc
    limit 1
    for update skip locked;

    if found then
      update public.app_credentials
      set is_used = true,
          transaction_id = v_tx.id,
          updated_at = now()
      where id = v_credential.id
      returning * into v_existing;
    end if;
  end if;

  if v_existing.id is null then
    return jsonb_build_object(
      'fulfilled', false,
      'credential_ready', false,
      'reason', case when coalesce(v_tx.status, '') in ('settlement', 'success', 'completed', 'paid') then 'No available credential' else 'Transaction not settled' end,
      'transaction_id', v_tx.id
    );
  end if;

  v_inventory_applied := coalesce((v_tx.fulfillment_data ->> 'inventory_applied')::boolean, false);
  v_coupon_applied := coalesce((v_tx.fulfillment_data ->> 'coupon_applied')::boolean, false);

  if not v_inventory_applied then
    update public.products
    set stock = greatest(stock - 1, 0),
        sold_count = coalesce(sold_count, 0) + 1,
        updated_at = now()
    where id = v_tx.product_id;
  end if;

  if v_tx.coupon_code is not null and not v_coupon_applied then
    update public.coupons
    set used_count = used_count + 1,
        updated_at = now()
    where code = v_tx.coupon_code;
  end if;

  v_fulfillment := coalesce(v_tx.fulfillment_data, '{}'::jsonb)
    || jsonb_build_object(
      'account_data', v_existing.account_data,
      'credential_id', v_existing.id,
      'credential_ready', true,
      'delivered_at', now(),
      'delivery_method', 'credential',
      'delivery_status', 'sent',
      'inventory_applied', true,
      'coupon_applied', case when v_tx.coupon_code is not null then true else v_coupon_applied end
    );

  update public.transactions
  set status = case when coalesce(status, '') in ('settlement', 'success', 'completed', 'paid') then status else 'settlement' end,
      paid_at = coalesce(paid_at, now()),
      fulfillment_data = v_fulfillment,
      updated_at = now()
  where id = v_tx.id;

  return jsonb_build_object(
    'fulfilled', true,
    'credential_ready', true,
    'transaction_id', v_tx.id,
    'credential_id', v_existing.id,
    'account_data', v_existing.account_data,
    'fulfillment_data', v_fulfillment
  );
end;
$$;

create or replace function public.sync_transaction_delivery(p_transaction_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions%rowtype;
  v_credential public.app_credentials%rowtype;
  v_fulfillment jsonb;
begin
  select *
  into v_tx
  from public.transactions
  where id = p_transaction_id
  limit 1;

  if not found then
    return '{}'::jsonb;
  end if;

  select *
  into v_credential
  from public.app_credentials
  where transaction_id = v_tx.id
  order by created_at asc
  limit 1;

  if not found then
    return coalesce(v_tx.fulfillment_data, '{}'::jsonb);
  end if;

  v_fulfillment := coalesce(v_tx.fulfillment_data, '{}'::jsonb)
    || jsonb_build_object(
      'account_data', v_credential.account_data,
      'credential_id', v_credential.id,
      'credential_ready', true,
      'delivery_method', 'credential',
      'delivery_status', 'sent'
    );

  update public.transactions
  set fulfillment_data = v_fulfillment,
      updated_at = now()
  where id = v_tx.id;

  return v_fulfillment;
end;
$$;

create or replace function public.handle_transaction_auto_fulfillment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if pg_trigger_depth() > 1 then
    return new;
  end if;

  if new.order_id is not null
     and coalesce(new.status, '') in ('settlement', 'success', 'completed', 'paid')
     and old.status is distinct from new.status then
    perform public.fulfill_transaction(new.order_id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_transactions_auto_fulfillment on public.transactions;
create trigger trg_transactions_auto_fulfillment
after update of status on public.transactions
for each row
when (new.status is distinct from old.status)
execute function public.handle_transaction_auto_fulfillment();

create or replace function public.handle_app_credential_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.transaction_id is not null then
    perform public.sync_transaction_delivery(new.transaction_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_app_credentials_sync on public.app_credentials;
create trigger trg_app_credentials_sync
after insert or update of transaction_id, is_used, account_data on public.app_credentials
for each row
execute function public.handle_app_credential_sync();

commit;
