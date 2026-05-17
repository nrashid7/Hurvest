# Farmer Self-Serve Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build immediate-publish farmer signup, onboarding, farm profile creation, and product creation.

**Architecture:** Extend the existing App Router pages and Server Actions. Add pure form helpers first, then wire signup, farmer actions, dashboard UI, and Supabase RLS policies.

**Tech Stack:** Next.js App Router, React Server Components, Server Actions, TypeScript, Supabase RLS, Vitest.

---

### Task 1: Form Helpers

**Files:**
- Modify: `src/lib/forms.ts`
- Test: `src/lib/forms.test.ts`

- [ ] Add tests for `asSignupRole` and `slugify`.
- [ ] Run `npm run test -- src/lib/forms.test.ts` and confirm the new tests fail.
- [ ] Implement the helpers.
- [ ] Run `npm run test -- src/lib/forms.test.ts` and confirm the tests pass.

### Task 2: Signup Flow

**Files:**
- Modify: `src/components/forms/auth-forms.tsx`
- Modify: `src/app/actions/auth.ts`

- [ ] Add account type controls to signup.
- [ ] Validate signup role in the Server Action.
- [ ] Save farmers as `role = "farmer"` and redirect them to `/farmer/onboarding`.

### Task 3: Farmer Creation Actions

**Files:**
- Modify: `src/app/actions/farmer.ts`
- Modify: `src/app/farmer/page.tsx`
- Create: `src/app/farmer/onboarding/page.tsx`

- [ ] Add `createFarmAction`.
- [ ] Add `createBoxAction`.
- [ ] Expand existing farmer edit actions to include slug, category, image fields, frequency, and capacity.
- [ ] Add onboarding route for first farm creation.
- [ ] Add dashboard create-box empty state.

### Task 4: Supabase Policies

**Files:**
- Create: `supabase/migrations/20260517023000_farmer_self_serve.sql`

- [ ] Add insert policy for farmers creating their own farms.
- [ ] Add insert policy for farmers creating boxes for owned farms.
- [ ] Keep existing admin and ownership policies intact.

### Task 5: Verification

**Files:**
- Project-wide

- [ ] Run `npm run test`.
- [ ] Run `npm run lint`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run build`.
