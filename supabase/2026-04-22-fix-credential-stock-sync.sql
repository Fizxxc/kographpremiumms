create or replace function public.fulfill_transaction(p_order_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx public.transactions%rowtype;
  v_credential public.app_credentials%rowtype;
  v_existing public.app_credentials%rowtype;
  v_fulfillment jsonb := '{}'::jsonb;
  v_apply_inventory boolean := false;
  v_apply_coupon boolean := false;
begin
  select *
  into v_tx
  from public.transactions
  where order_id = p_order_id
  for update;

  if not found then
    raise exception 'Transaction not found for order_id: %', p_order_id;
  end if;

  v_fulfillment := coalesce(v_tx.fulfillment_data, '{}'::jsonb);

  select *
  into v_existing
  from public.app_credentials
  where transaction_id = v_tx.id
  order by updated_at desc nulls last, created_at asc
  limit 1;

  if found then
    v_apply_inventory := not coalesce((v_fulfillment ->> 'inventory_applied')::boolean, false);
    v_apply_coupon :=
      v_tx.coupon_code is not null
      and btrim(v_tx.coupon_code) <> ''
      and not coalesce((v_fulfillment ->> 'coupon_applied')::boolean, false);

    if v_apply_inventory then
      update public.products
      set stock = greatest(coalesce(stock, 0) - 1, 0),
          sold_count = coalesce(sold_count, 0) + 1,
          updated_at = now()
      where id = v_tx.product_id;
    end if;

    if v_apply_coupon then
      update public.coupons
      set used_count = coalesce(used_count, 0) + 1,
          updated_at = now()
      where lower(code) = lower(v_tx.coupon_code);
    end if;

    v_fulfillment := v_fulfillment
      || jsonb_build_object(
        'delivery_type', 'credential',
        'credential_id', v_existing.id,
        'credential_ready', true,
        'account_data', v_existing.account_data,
        'inventory_applied', true,
        'coupon_applied', case when v_tx.coupon_code is not null and btrim(v_tx.coupon_code) <> '' then true else coalesce((v_fulfillment ->> 'coupon_applied')::boolean, false) end
      );

    update public.transactions
    set status = 'settlement',
        fulfillment_data = v_fulfillment,
        updated_at = now()
    where id = v_tx.id
    returning * into v_tx;

    return jsonb_build_object(
      'fulfilled', true,
      'already_settled', true,
      'just_assigned', false,
      'reconciled_inventory', v_apply_inventory,
      'reconciled_coupon', v_apply_coupon,
      'transaction_id', v_tx.id,
      'credential_id', v_existing.id,
      'account_data', v_existing.account_data,
      'fulfillment_data', v_fulfillment
    );
  end if;

  if lower(coalesce(v_tx.status, 'pending')) not in ('pending', 'capture', 'settlement', 'success', 'paid', 'completed') then
    raise exception 'Transaction not payable';
  end if;

  select *
  into v_credential
  from public.app_credentials
  where product_id = v_tx.product_id
    and is_used = false
    and transaction_id is null
  order by created_at asc
  limit 1
  for update skip locked;

  if not found then
    return jsonb_build_object(
      'fulfilled', false,
      'reason', 'No available credential',
      'transaction_id', v_tx.id,
      'already_settled', lower(coalesce(v_tx.status, '')) in ('settlement', 'capture', 'success', 'paid', 'completed')
    );
  end if;

  update public.app_credentials
  set is_used = true,
      transaction_id = v_tx.id,
      updated_at = now()
  where id = v_credential.id
  returning * into v_credential;

  v_apply_inventory := not coalesce((v_fulfillment ->> 'inventory_applied')::boolean, false);
  if v_apply_inventory then
    update public.products
    set stock = greatest(coalesce(stock, 0) - 1, 0),
        sold_count = coalesce(sold_count, 0) + 1,
        updated_at = now()
    where id = v_tx.product_id;
  end if;

  v_apply_coupon :=
    v_tx.coupon_code is not null
    and btrim(v_tx.coupon_code) <> ''
    and not coalesce((v_fulfillment ->> 'coupon_applied')::boolean, false);

  if v_apply_coupon then
    update public.coupons
    set used_count = coalesce(used_count, 0) + 1,
        updated_at = now()
    where lower(code) = lower(v_tx.coupon_code);
  end if;

  v_fulfillment := v_fulfillment
    || jsonb_build_object(
      'delivery_type', 'credential',
      'credential_id', v_credential.id,
      'credential_ready', true,
      'account_data', v_credential.account_data,
      'inventory_applied', true,
      'coupon_applied', case when v_tx.coupon_code is not null and btrim(v_tx.coupon_code) <> '' then true else coalesce((v_fulfillment ->> 'coupon_applied')::boolean, false) end
    );

  update public.transactions
  set status = 'settlement',
      fulfillment_data = v_fulfillment,
      updated_at = now()
  where id = v_tx.id
  returning * into v_tx;

  return jsonb_build_object(
    'fulfilled', true,
    'already_settled', false,
    'just_assigned', true,
    'transaction_id', v_tx.id,
    'credential_id', v_credential.id,
    'account_data', v_credential.account_data,
    'fulfillment_data', v_fulfillment
  );
end;
$$;
