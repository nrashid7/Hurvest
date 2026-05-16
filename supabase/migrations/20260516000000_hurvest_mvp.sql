create extension if not exists pgcrypto;
create schema if not exists private;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'farmer', 'admin')),
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.farms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid null references public.profiles(id) on delete set null,
  name text not null,
  slug text not null unique,
  short_description text not null,
  story text not null,
  location text not null,
  city text not null,
  state text not null default 'Minnesota',
  image_url text not null,
  banner_url text not null,
  category text not null default 'mixed' check (category in ('produce', 'meat', 'eggs', 'mixed')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boxes (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  farmer_message text not null,
  price_cents integer not null check (price_cents > 0),
  currency text not null default 'usd',
  frequency text not null default 'weekly' check (frequency in ('weekly', 'biweekly', 'monthly')),
  delivery_day text not null default 'Friday',
  cutoff_day text not null default 'Wednesday',
  image_url text not null,
  active boolean not null default true,
  max_subscribers integer null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (farm_id, slug)
);

create table public.box_items (
  id uuid primary key default gen_random_uuid(),
  box_id uuid not null references public.boxes(id) on delete cascade,
  name text not null,
  quantity text,
  sort_order integer not null default 1,
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  box_id uuid not null references public.boxes(id) on delete restrict,
  farm_id uuid not null references public.farms(id) on delete restrict,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  frequency text not null default 'weekly',
  price_cents integer not null,
  next_delivery_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  farm_id uuid not null references public.farms(id) on delete restrict,
  box_id uuid not null references public.boxes(id) on delete restrict,
  delivery_date date not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled')),
  total_cents integer not null,
  delivery_address text not null,
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.delivery_runs (
  id uuid primary key default gen_random_uuid(),
  delivery_date date not null unique,
  status text not null default 'planning',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_profiles_updated_at before update on public.profiles for each row execute function public.touch_updated_at();
create trigger touch_farms_updated_at before update on public.farms for each row execute function public.touch_updated_at();
create trigger touch_boxes_updated_at before update on public.boxes for each row execute function public.touch_updated_at();
create trigger touch_subscriptions_updated_at before update on public.subscriptions for each row execute function public.touch_updated_at();
create trigger touch_orders_updated_at before update on public.orders for each row execute function public.touch_updated_at();
create trigger touch_delivery_runs_updated_at before update on public.delivery_runs for each row execute function public.touch_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function private.is_farm_owner(farm_uuid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.farms
    where id = farm_uuid and owner_id = (select auth.uid())
  );
$$;

grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;
grant execute on function private.is_farm_owner(uuid) to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.boxes enable row level security;
alter table public.box_items enable row level security;
alter table public.subscriptions enable row level security;
alter table public.orders enable row level security;
alter table public.delivery_runs enable row level security;

create policy "Profiles are readable by owner or admin" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or private.is_admin());
create policy "Customers update own profile" on public.profiles
  for update to authenticated using (id = (select auth.uid()) or private.is_admin()) with check (id = (select auth.uid()) or private.is_admin());
create policy "Customers create own profile" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));

create policy "Anyone can read active farms" on public.farms
  for select to anon, authenticated using (active = true or owner_id = (select auth.uid()) or private.is_admin());
create policy "Farmers update own farms" on public.farms
  for update to authenticated using (owner_id = (select auth.uid()) or private.is_admin()) with check (owner_id = (select auth.uid()) or private.is_admin());
create policy "Admins manage farms" on public.farms
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Anyone can read active boxes" on public.boxes
  for select to anon, authenticated using (active = true or private.is_farm_owner(farm_id) or private.is_admin());
create policy "Farmers update own boxes" on public.boxes
  for update to authenticated using (private.is_farm_owner(farm_id) or private.is_admin()) with check (private.is_farm_owner(farm_id) or private.is_admin());
create policy "Admins manage boxes" on public.boxes
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Anyone can read items for visible boxes" on public.box_items
  for select to anon, authenticated using (
    exists (select 1 from public.boxes where boxes.id = box_items.box_id and boxes.active = true)
    or private.is_admin()
  );
create policy "Farmers manage own box items" on public.box_items
  for all to authenticated using (
    exists (select 1 from public.boxes where boxes.id = box_items.box_id and private.is_farm_owner(boxes.farm_id))
    or private.is_admin()
  ) with check (
    exists (select 1 from public.boxes where boxes.id = box_items.box_id and private.is_farm_owner(boxes.farm_id))
    or private.is_admin()
  );

create policy "Customers read own subscriptions" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()) or private.is_farm_owner(farm_id) or private.is_admin());
create policy "Customers update own subscription state" on public.subscriptions
  for update to authenticated using (user_id = (select auth.uid()) or private.is_admin()) with check (user_id = (select auth.uid()) or private.is_admin());
create policy "Admins manage subscriptions" on public.subscriptions
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Customers and farmers read relevant orders" on public.orders
  for select to authenticated using (user_id = (select auth.uid()) or private.is_farm_owner(farm_id) or private.is_admin());
create policy "Admins update orders" on public.orders
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy "Admins manage orders" on public.orders
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

create policy "Admins read delivery runs" on public.delivery_runs
  for select to authenticated using (private.is_admin());
create policy "Admins manage delivery runs" on public.delivery_runs
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

insert into public.farms (id, name, slug, short_description, story, location, city, state, image_url, banner_url, category)
values
  ('11111111-1111-4111-8111-111111111111', 'Northstar Produce Co.', 'northstar-produce', 'Crisp greens, roots, herbs, and seasonal produce grown outside Northfield.', 'Northstar Produce grows vegetables in small, carefully rotated fields with a focus on soil health, flavor, and steady weekly harvests.', 'Northfield, MN', 'Northfield', 'Minnesota', 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1800&q=80', 'produce'),
  ('22222222-2222-4222-8222-222222222222', 'Linden Hollow Organics', 'linden-hollow-organics', 'Organic vegetable boxes with tender greens, pantry staples, and farmer notes.', 'Linden Hollow is a family-run organic vegetable farm near Stillwater with colorful weekly boxes.', 'Stillwater, MN', 'Stillwater', 'Minnesota', 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=1800&q=80', 'mixed'),
  ('33333333-3333-4333-8333-333333333333', 'Red Barn Pastures', 'red-barn-pastures', 'Pasture-raised proteins curated for simple Friday dinners and weekend meals.', 'Red Barn Pastures works with rotational grazing and small-batch butchery partners.', 'Mankato, MN', 'Mankato', 'Minnesota', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?auto=format&fit=crop&w=1800&q=80', 'meat'),
  ('44444444-4444-4444-8444-444444444444', 'Meadowbrook Dairy & Eggs', 'meadowbrook-dairy-eggs', 'Weekly staples from pasture hens and small Minnesota dairy makers.', 'Meadowbrook partners with nearby creameries and keeps a small flock of pasture hens.', 'St. Joseph, MN', 'St. Joseph', 'Minnesota', 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=1400&q=80', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1800&q=80', 'eggs');

insert into public.boxes (id, farm_id, title, slug, description, farmer_message, price_cents, image_url, max_subscribers)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', 'Friday Produce Box', 'friday-produce-box', 'A weekly mix of crisp greens, seasonal vegetables, herbs, and one simple fruit or storage crop.', 'This week is bright and green: tender lettuces, breakfast radishes, asparagus, chives, and rhubarb.', 3900, 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1400&q=80', 80),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', 'Family Harvest Box', 'family-harvest-box', 'A fuller weekly vegetable box for families who cook several meals at home.', 'We added extra carrots and greenhouse cucumbers this week because the beds are coming in beautifully.', 5900, 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=1400&q=80', 60),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', '33333333-3333-4333-8333-333333333333', 'Pasture Protein Box', 'pasture-protein-box', 'A curated weekly protein box with pasture-raised cuts selected for practical home cooking.', 'This week includes grill-friendly cuts and a slow-cooker roast for an easy weekend meal.', 7500, 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1400&q=80', 45),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', '44444444-4444-4444-8444-444444444444', 'Egg & Dairy Staples Box', 'egg-dairy-staples-box', 'A compact weekly box of eggs, butter, cultured dairy, and rotating small-batch staples.', 'The hens are laying steadily. This box includes extra-rich yogurt from our creamery partner.', 2900, 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?auto=format&fit=crop&w=1400&q=80', 100);

insert into public.box_items (box_id, name, quantity, sort_order)
values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Butter lettuce', '1 head', 1),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Asparagus', '1 bunch', 2),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Breakfast radishes', '1 bunch', 3),
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Rhubarb', '1 lb', 4),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Spinach', '8 oz', 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Greenhouse cucumbers', '3', 2),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Carrots', '2 lb', 3),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Ground beef', '2 lb', 1),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Pork shoulder roast', '2.5 lb', 2),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'Chicken thighs', '2 lb', 3),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Pasture eggs', '1 dozen', 1),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Cultured butter', '8 oz', 2),
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Whole milk yogurt', '24 oz', 3);

insert into public.delivery_runs (delivery_date, status, notes)
values ('2026-05-22', 'planning', 'Confirm final farm counts after Wednesday cutoff. North loop first, Saint Paul second.');
