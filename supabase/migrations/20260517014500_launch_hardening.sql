create or replace function private.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_role = 'service_role' then
    return new;
  end if;

  if old.role is distinct from new.role and not private.is_admin() then
    raise exception 'Only admins can change profile roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_profile_role_escalation on public.profiles;

create trigger prevent_profile_role_escalation
  before update on public.profiles
  for each row execute function private.prevent_profile_role_escalation();

create or replace function private.enforce_customer_subscription_update_scope()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_role = 'service_role' then
    return new;
  end if;

  if private.is_admin() then
    return new;
  end if;

  if old.user_id <> (select auth.uid()) then
    raise exception 'Only subscription owners can update their subscription.';
  end if;

  if new.user_id is distinct from old.user_id
    or new.box_id is distinct from old.box_id
    or new.farm_id is distinct from old.farm_id
    or new.stripe_customer_id is distinct from old.stripe_customer_id
    or new.stripe_subscription_id is distinct from old.stripe_subscription_id
    or new.frequency is distinct from old.frequency
    or new.price_cents is distinct from old.price_cents
    or new.next_delivery_date is distinct from old.next_delivery_date then
    raise exception 'Customers can only update subscription status.';
  end if;

  if new.status not in ('paused', 'canceled') then
    raise exception 'Customers can only pause or cancel subscriptions.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_customer_subscription_update_scope on public.subscriptions;

create trigger enforce_customer_subscription_update_scope
  before update on public.subscriptions
  for each row execute function private.enforce_customer_subscription_update_scope();

create or replace function private.enforce_box_subscription_capacity()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  capacity integer;
  active_count integer;
begin
  if new.status not in ('active', 'trialing') then
    return new;
  end if;

  select max_subscribers
  into capacity
  from public.boxes
  where id = new.box_id
  for update;

  if capacity is null then
    return new;
  end if;

  select count(*)
  into active_count
  from public.subscriptions
  where box_id = new.box_id
    and status in ('active', 'trialing')
    and id <> coalesce(new.id, '00000000-0000-0000-0000-000000000000'::uuid);

  if active_count >= capacity then
    raise exception 'Box subscription capacity has been reached.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_box_subscription_capacity on public.subscriptions;

create trigger enforce_box_subscription_capacity
  before insert or update on public.subscriptions
  for each row execute function private.enforce_box_subscription_capacity();
