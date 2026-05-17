import type { BoxItem, OrderStatus, SubscriptionStatus, UserRole } from "@/lib/types";

export const orderStatuses: OrderStatus[] = ["pending", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"];
export const subscriptionStatuses: SubscriptionStatus[] = ["active", "trialing", "past_due", "paused", "canceled", "incomplete"];
export const userRoles: UserRole[] = ["customer", "farmer", "admin"];
export const signupRoles = ["customer", "farmer"] as const;
export const farmCategories = ["produce", "meat", "eggs", "mixed"] as const;
export const frequencies = ["weekly", "biweekly", "monthly"] as const;

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function sanitizeNextPath(value: FormDataEntryValue | null, fallback = "/account") {
  const next = String(value ?? fallback).trim();
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\") || next.includes(":")) {
    return fallback;
  }

  return next;
}

export function isUuid(value: string) {
  return uuidPattern.test(value);
}

export function isSlug(value: string) {
  return slugPattern.test(value);
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseBooleanSwitch(value: FormDataEntryValue | null) {
  return value === "on";
}

export function parseOptionalInteger(value: FormDataEntryValue | null) {
  const input = String(value ?? "").trim();
  if (!input) return null;
  const parsed = Number(input);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

export function parseBoxItems(rawItems: FormDataEntryValue | null) {
  return String(rawItems ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const pipeParts = line.split("|").map((part) => part.trim());
      if (pipeParts.length >= 2 && pipeParts[1]) {
        return { name: pipeParts.slice(1).join(" | "), quantity: pipeParts[0] || null, sort_order: index + 1 };
      }

      const quantityMatch = line.match(/^((?:\d+(?:\.\d+)?|\d+\/\d+)(?:\s+(?:dozen|lb|lbs|oz|head|heads|bunch|bunches|bag|bags|pint|pints|quart|quarts|jar|jars|piece|pieces))?)\s+(.+)$/i);
      if (quantityMatch?.[2]) {
        return { name: quantityMatch[2], quantity: quantityMatch[1], sort_order: index + 1 };
      }

      return { name: line, quantity: null, sort_order: index + 1 };
    });
}

export function serializeBoxItems(items: Pick<BoxItem, "name" | "quantity">[]) {
  return items.map((item) => (item.quantity ? `${item.quantity} | ${item.name}` : item.name)).join("\n");
}

export function asOrderStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "");
  return orderStatuses.includes(status as OrderStatus) ? (status as OrderStatus) : null;
}

export function asSubscriptionStatus(value: FormDataEntryValue | null) {
  const status = String(value ?? "");
  return subscriptionStatuses.includes(status as SubscriptionStatus) ? (status as SubscriptionStatus) : null;
}

export function asUserRole(value: FormDataEntryValue | null) {
  const role = String(value ?? "");
  return userRoles.includes(role as UserRole) ? (role as UserRole) : null;
}

export function asSignupRole(value: FormDataEntryValue | null) {
  const role = String(value ?? "");
  return signupRoles.includes(role as (typeof signupRoles)[number]) ? role : null;
}

export function asFarmCategory(value: FormDataEntryValue | null) {
  const category = String(value ?? "");
  return farmCategories.includes(category as (typeof farmCategories)[number]) ? category : null;
}

export function asFrequency(value: FormDataEntryValue | null) {
  const frequency = String(value ?? "");
  return frequencies.includes(frequency as (typeof frequencies)[number]) ? frequency : null;
}
