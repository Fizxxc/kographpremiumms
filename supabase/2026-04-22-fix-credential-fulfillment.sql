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
  order by updated_at desc, created_at asc
  limit 1;

  if found then
    return jsonb_build_object(
      'fulfilled', true,
      'already_settled', true,
      'just_assigned', false,
      'transaction_id', v_tx.id,
      'credential_id', v_existing.id,
      'account_data', v_existing.account_data
    );
  end if;

  if v_tx.status not in ('pending', 'capture', 'settlement') then
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
      'already_settled', v_tx.status = 'settlement'
    );
  end if;

  update public.app_credentials
  set is_used = true,
      transaction_id = v_tx.id,
      updated_at = now()
  where id = v_credential.id
  returning * into v_credential;

  update public.transactions
  set status = 'settlement',
      fulfillment_data = coalesce(fulfillment_data, '{}'::jsonb) || jsonb_build_object(
        'delivery_type', 'credential',
        'credential_id', v_credential.id,
        'credential_ready', true
      ),
      updated_at = now()
  where id = v_tx.id
  returning * into v_tx;

  update public.products
  set stock = greatest(stock - 1, 0),
      updated_at = now()
  where id = v_tx.product_id;

  if v_tx.coupon_code is not null and btrim(v_tx.coupon_code) <> '' then
    update public.coupons
    set used_count = used_count + 1,
        updated_at = now()
    where lower(code) = lower(v_tx.coupon_code);
  end if;

  return jsonb_build_object(
    'fulfilled', true,
    'already_settled', false,
    'just_assigned', true,
    'transaction_id', v_tx.id,
    'credential_id', v_credential.id,
    'account_data', v_credential.account_data
  );
end;
$$;
