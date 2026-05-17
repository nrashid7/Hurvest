# Hurvest Paid Beta Launch Runbook

## Pre-Launch Setup

- Apply every Supabase migration in timestamp order, including the order delivery idempotency migration.
- Set production environment variables in Vercel:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_APP_URL`
  - `NEXT_PUBLIC_SUPPORT_EMAIL`
  - Stripe keys and webhook secret once the Stripe account is ready.
- Leave `HURVEST_DEMO_MODE` empty or set to `false` in production. Only set it to `true` for a deliberate demo deployment.
- Replace demo farms, boxes, prices, images, and capacity counts with real launch data.
- Confirm launch delivery ZIPs in `src/lib/launch.ts`.

## Farmer Onboarding

- Farmer creates an account from `/signup` and selects `Farmer`.
- Farmer completes `/farmer/onboarding` to publish the farm profile immediately.
- Farmer creates the first offering from `/farmer`.
- Farmer can edit farm profile, images, category, product details, included items, weekly price, active status, and max subscribers from `/farmer`.
- Admin can still manage roles, farm ownership, farms, and boxes from `/admin` when support intervention is needed.

## Customer Checkout Rehearsal

- Create a customer account.
- Fill out full delivery profile.
- Confirm unsupported ZIPs are blocked before checkout.
- Confirm supported ZIPs reach Stripe Checkout when Stripe env vars are configured.
- After test checkout, confirm `/account`, `/admin`, `/farmer`, and `/admin/orders.csv` all show the first order.

## Weekly Operations

- Monday or Tuesday: farmers update this week's box items and farmer message.
- Wednesday night: stop manual changes after cutoff.
- Thursday morning: generate due orders in `/admin`, then export `/admin/orders.csv`.
- Thursday: share order counts and delivery addresses with farms/delivery operator.
- Friday: update order statuses as packed, out for delivery, and delivered.

## Support

- Customers should email the configured support address for payment, address, pause/cancel, or delivery issues.
- Admin should handle subscription status and order status changes from `/admin`.
- Farmer-facing changes include self-serve farm profile creation, product/box creation, item updates, capacity, and availability during paid beta.
