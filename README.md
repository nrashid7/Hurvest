# Hurvest

Hurvest is a production-ready MVP for a Minnesota-first farm box subscription platform. It is intentionally subscription-first, curated-box-first, and simple enough for manual Friday delivery operations while still covering customer, farmer, and admin workflows.

The app supports a paid beta launch model: farmers publish weekly boxes, customers subscribe through Stripe Checkout, admins generate delivery runs, and operations export CSVs for manual coordination.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase Auth, Postgres, RLS
- Stripe Checkout subscriptions and webhook sync scaffold
- Vercel-ready deployment

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Without Supabase or Stripe credentials, the app runs in demo mode with realistic farms, boxes, subscriptions, orders, and operational dashboards.

## Environment Variables

Keep real values in `.env.local` or your deployment provider. Do not paste production, staging, or personal credentials into the public repository or README.
Demo data is enabled automatically outside production when Supabase is not configured. In production, demo data is disabled unless the demo override is explicitly enabled.

For the repository security policy and secret handling checklist, see `SECURITY.md`.

## Supabase Setup

1. Create a Supabase project.
2. Configure Supabase environment values locally or in your deployment provider.
3. Apply every migration in `supabase/migrations` in timestamp order.
4. Create users in Supabase Auth or through `/signup`. New auth users automatically receive a customer or farmer profile based on signup type.
5. Promote demo operators from `/admin` or by updating matching rows in `profiles`:
   - `customer@hurvest.local` with role `customer`
   - `farmer@hurvest.local` with role `farmer`
   - `admin@hurvest.local` with role `admin`
6. Farmers can self-serve from `/signup` to `/farmer/onboarding`, or admins can still assign farm owners from `/admin`.

The migration enables RLS for all public tables. Customers can manage their own profile and read their own orders/subscriptions. Farmers can create and manage their own farm, boxes, and box items. Admins can operate the system. RLS helper functions live in the private schema, outside the exposed public API surface.
The launch hardening migration also blocks customer role escalation, restricts customer subscription updates to pause/cancel status changes, and enforces box capacity inside Postgres.

## Stripe Setup

1. Add the Stripe server-side credentials in your local or deployment environment.
2. Create a webhook endpoint pointing to:

```text
https://your-domain.com/api/stripe/webhook
```

3. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Add the webhook signing secret in your local or deployment environment.

Checkout uses Stripe subscription mode with `user_id`, `box_id`, and `farm_id` metadata.

## Core Routes

- `/` conversion-focused homepage
- `/farms` farm box marketplace with simple category filters
- `/farms/[slug]` emotional farm detail page
- `/boxes/[id]` primary subscription conversion page
- `/account` customer dashboard
- `/farmer/onboarding` self-serve farmer profile creation
- `/farmer` farmer dashboard for farm profile and product/box management
- `/admin` operational control center
- `/admin/orders.csv` CSV export for manual delivery coordination

Admins can generate due weekly orders from `/admin` for active subscriptions. The operation is idempotent for each `subscription_id` and `delivery_date`, creates the delivery run if needed, and advances each processed subscription to its next delivery date.

## Quality Commands

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Deployment

Deploy to Vercel, add the environment variables, apply the Supabase migrations, then configure the Stripe webhook to the production URL.

## Launch Operations

See `docs/launch-runbook.md` for the paid beta setup, farmer onboarding, customer checkout rehearsal, weekly delivery workflow, and support process.
