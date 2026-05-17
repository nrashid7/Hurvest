create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(nullif(new.raw_user_meta_data ->> 'signup_role', ''), 'customer');

  if requested_role not in ('customer', 'farmer') then
    requested_role := 'customer';
  end if;

  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    requested_role
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case
      when public.profiles.role = 'customer' and excluded.role = 'farmer' then 'farmer'
      else public.profiles.role
    end;

  return new;
end;
$$;

drop policy if exists "Customers create own profile" on public.profiles;

create policy "Users create own customer or farmer profile" on public.profiles
  for insert to authenticated
  with check (id = (select auth.uid()) and role in ('customer', 'farmer'));

create policy "Farmers create own farms" on public.farms
  for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "Farmers create boxes for own farms" on public.boxes
  for insert to authenticated
  with check (private.is_farm_owner(farm_id));
