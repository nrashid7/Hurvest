# Hurvest

Hurvest is a production-ready MVP for a Minnesota-first farm box subscription platform. It is intentionally subscription-first, curated-box-first, and simple enough for manual Friday delivery operations.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- Supabase Auth, Postgres, RLS
- Stripe Checkout subscriptions and webhook sync scaffold
- Vercel-ready deployment

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase or Stripe credentials, the app runs in demo mode with realistic farms, boxes, subscriptions, orders, and operational dashboards.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` to the browser.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill in the Supabase URL and keys.
3. Apply every migration in `supabase/migrations` in timestamp order.
4. Create users in Supabase Auth. New auth users automatically receive a customer profile.
5. Promote demo operators from `/admin` or by updating matching rows in `profiles`:
   - `customer@hurvest.local` with role `customer`
   - `farmer@hurvest.local` with role `farmer`
   - `admin@hurvest.local` with role `admin`
6. Assign a farm owner from `/admin` after the farmer profile exists.

The migration enables RLS for all public tables. Customers can manage their own profile and read their own orders/subscriptions. Farmers can manage their assigned farm and boxes. Admins can operate the system. RLS helper functions live in the private schema, outside the exposed public API surface.

## Stripe Setup

1. Add `STRIPE_SECRET_KEY`.
2. Create a webhook endpoint pointing to:

```text
https://your-domain.com/api/stripe/webhook
```

3. Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Add the signing secret as `STRIPE_WEBHOOK_SECRET`.

Checkout uses Stripe subscription mode with `user_id`, `box_id`, and `farm_id` metadata.

## Core Routes

- `/` conversion-focused homepage
- `/farms` farm box marketplace with simple category filters
- `/farms/[slug]` emotional farm detail page
- `/boxes/[id]` primary subscription conversion page
- `/account` customer dashboard
- `/farmer` farmer dashboard
- `/admin` operational control center
- `/admin/orders.csv` CSV export for manual delivery coordination

## Quality Commands

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

## Deployment

Deploy to Vercel, add the environment variables, apply the Supabase migration, then configure the Stripe webhook to the production URL.
