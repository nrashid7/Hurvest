create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

create index if not exists farms_owner_id_idx on public.farms(owner_id);
create index if not exists boxes_farm_id_idx on public.boxes(farm_id);
create index if not exists subscriptions_user_id_idx on public.subscriptions(user_id);
create index if not exists subscriptions_farm_id_idx on public.subscriptions(farm_id);
create index if not exists orders_delivery_date_idx on public.orders(delivery_date);
create index if not exists orders_farm_id_idx on public.orders(farm_id);
