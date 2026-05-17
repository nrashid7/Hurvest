create unique index if not exists orders_subscription_delivery_date_idx
  on public.orders(subscription_id, delivery_date);
