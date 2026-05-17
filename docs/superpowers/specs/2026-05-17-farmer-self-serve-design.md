# Farmer Self-Serve Design

## Goal

Farmers can sign up, create their public farm profile, create subscription box offerings, and go live immediately without admin approval.

## Scope

- Add account type selection to signup.
- Let farmer signup create a `farmer` profile and route to farmer onboarding.
- Add farmer onboarding for the first farm profile.
- Let farmers create their first product/box and then edit farm and box details from `/farmer`.
- Add RLS policies that permit farmers to create farms they own and boxes/items for those farms.
- Keep admin workflows intact.

## Design

The app keeps the existing App Router, Server Action, and Supabase patterns. Signup remains a single form, but includes `account_type` with `customer` and `farmer`. The server action validates the role, writes the profile role, and redirects farmers to `/farmer/onboarding`.

The onboarding route is protected by `requireRole(["farmer", "admin"])`. If the current farmer already owns a farm, it redirects to `/farmer`. Otherwise it shows a farm creation form. Created farms are owned by the current profile and `active = true` so they publish immediately.

The farmer dashboard remains the main management surface. It gains full farm and box fields, plus a create-box form when no product exists. Created boxes are active immediately and public if their farm is active.

## Data And Security

New RLS policies allow authenticated farmers to insert farms with `owner_id = auth.uid()` and boxes tied to farms they own. Existing update/read policies continue to enforce ownership. Farmers cannot create records for another owner because both the action and RLS policy check ownership.

## Verification

Run the existing quality commands:

- `npm run test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
